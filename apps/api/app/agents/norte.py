"""Agente Norte — coach diário de metas e orçamentos."""

from __future__ import annotations

import json
import uuid
from datetime import date, timedelta

from openai.types.chat import ChatCompletionMessageParam
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import AgentResult, NoxAgent
from app.core.config import get_settings
from app.models.agent_insight import AgentInsight
from app.models.transaction import Transaction
from app.models.user import User

settings = get_settings()

SYSTEM_PROMPT = """\
Você é o Norte, coach financeiro do Nox.
Missão diária: verificar se o usuário está no ritmo certo de gastos para o mês.

Calcule o "ritmo ideal": total gasto dividido pelo dia atual do mes, vezes o total de dias do mes.
Compare com o gasto atual. Dê um coaching direto e motivador.

Regras obrigatórias:
- Responda SOMENTE com JSON válido, sem markdown.
- Linguagem sempre em português brasileiro.
- Tom de coach: encorajador, nunca julgador.
- Comece "mensagem_do_dia" com "Faltam..." ou "Você está..." ou "Atenção:"
- Valores no formato "R$ X.XXX,XX".

Schema de resposta:
{
  "gasto_mes_atual": "R$ X,XX",
  "ritmo_projetado_mensal": "R$ X,XX",
  "saude_financeira": "otima|boa|atencao|critica",
  "percentual_do_mes_gasto": X,
  "mensagem_do_dia": "... (max 180 chars)",
  "dica": "... (max 120 chars)"
}
"""


class Norte(NoxAgent):
    name = "Norte"
    agent_type = "norte"
    model = settings.openai_model_mini  # gpt-4o-mini
    monthly_token_budget = 100_000  # roda todo dia

    async def should_run(self, user_id: uuid.UUID, db: AsyncSession) -> bool:
        """Roda uma vez por dia — pula se já rodou hoje."""
        today = date.today()
        result = await db.execute(
            select(AgentInsight.id)
            .where(
                AgentInsight.user_id == user_id,
                AgentInsight.agent_type == "norte",
                func.date(AgentInsight.created_at) == today,
            )
            .limit(1)
        )
        return result.scalar_one_or_none() is None

    async def _build_messages(
        self, user_id: uuid.UUID, db: AsyncSession
    ) -> list[ChatCompletionMessageParam]:
        today = date.today()
        primeiro_dia = today.replace(day=1)
        # Dias no mês corrente via "primeiro dia do próximo mês - 1 dia"
        if today.month < 12:
            dias_no_mes = (today.replace(month=today.month + 1, day=1) - timedelta(days=1)).day
        else:
            dias_no_mes = 31

        result_tx = await db.execute(
            select(Transaction)
            .where(
                Transaction.user_id == user_id,
                Transaction.transaction_date >= primeiro_dia,
                Transaction.transaction_date <= today,
                Transaction.type == "DEBIT",
            )
            .order_by(Transaction.transaction_date.desc())
            .limit(300)
        )
        transactions = list(result_tx.scalars().all())

        result_user = await db.execute(select(User).where(User.id == user_id))
        user = result_user.scalar_one_or_none()

        gasto_total = sum(float(tx.amount) for tx in transactions)
        dias_passados = today.day

        primeiro_nome = ""
        if user and user.name:
            primeiro_nome = user.name.split()[0]

        payload: dict[str, object] = {
            "nome": primeiro_nome,
            "dia_atual": dias_passados,
            "dias_no_mes": dias_no_mes,
            "gasto_mes_atual": round(gasto_total, 2),
            "n_transacoes": len(transactions),
        }

        return [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    "Dados financeiros de hoje para o coaching diário:\n"
                    + json.dumps(payload, ensure_ascii=False)
                ),
            },
        ]

    def _parse_response(self, raw: str) -> AgentResult:
        if not raw:
            return AgentResult(content="Continue no caminho certo! Acompanhe seus gastos hoje.")
        try:
            data: dict[str, object] = json.loads(raw)
            return AgentResult(
                content=str(data.get("mensagem_do_dia", "Bom dia! Fique de olho nos seus gastos.")),
                metadata=data,
            )
        except json.JSONDecodeError:
            return AgentResult(content="Bom dia! Acompanhe seus gastos hoje.")
