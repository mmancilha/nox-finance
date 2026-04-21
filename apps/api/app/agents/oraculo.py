"""Agente Oráculo — análise semanal e previsões."""

from __future__ import annotations

import json
import uuid
from datetime import UTC, date, datetime, timedelta

from openai.types.chat import ChatCompletionMessageParam
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import AgentResult, NoxAgent
from app.core.config import get_settings
from app.models.agent_insight import AgentInsight
from app.models.transaction import Transaction

settings = get_settings()

SYSTEM_PROMPT = """\
Você é o Oráculo, analista financeiro do Nox.
Sua missão semanal: comparar os gastos desta semana com a semana anterior e gerar
insights preditivos sobre o mês.

Regras obrigatórias:
- Responda SOMENTE com JSON válido, sem markdown.
- Linguagem sempre em português brasileiro.
- Valores no formato "R$ X.XXX,XX".
- Comece o campo "insight_principal" com "A tendência esse mês é..."

Schema de resposta:
{
  "total_semana_atual": "R$ X,XX",
  "total_semana_anterior": "R$ X,XX",
  "variacao_percentual": "+X% | -X%",
  "categorias_top": [{"categoria": "...", "total": "R$ X,XX"}],
  "previsao_mensal": "R$ X,XX",
  "insight_principal": "A tendência esse mês é... (max 200 chars)",
  "recomendacao": "... (max 150 chars)"
}
"""


class Oraculo(NoxAgent):
    name = "Oráculo"
    agent_type = "oraculo"
    model = settings.openai_model_full  # gpt-4o
    monthly_token_budget = 20_000  # roda 4x/mês no máximo

    async def should_run(self, user_id: uuid.UUID, db: AsyncSession) -> bool:
        """Roda apenas se não gerou insight nos últimos 6 dias."""
        cutoff = datetime.now(UTC) - timedelta(days=6)
        result = await db.execute(
            select(AgentInsight.id)
            .where(
                AgentInsight.user_id == user_id,
                AgentInsight.agent_type == "oraculo",
                AgentInsight.created_at >= cutoff,
            )
            .limit(1)
        )
        return result.scalar_one_or_none() is None

    async def _build_messages(
        self, user_id: uuid.UUID, db: AsyncSession
    ) -> list[ChatCompletionMessageParam]:
        today = date.today()
        semana_atual_inicio = today - timedelta(days=7)
        semana_anterior_inicio = today - timedelta(days=14)

        async def _fetch_week(start: date, end: date) -> list[Transaction]:
            res = await db.execute(
                select(Transaction)
                .where(
                    Transaction.user_id == user_id,
                    Transaction.transaction_date >= start,
                    Transaction.transaction_date < end,
                    Transaction.type == "DEBIT",
                )
                .order_by(Transaction.transaction_date.desc())
                .limit(200)
            )
            return list(res.scalars().all())

        atual = await _fetch_week(semana_atual_inicio, today)
        anterior = await _fetch_week(semana_anterior_inicio, semana_atual_inicio)

        def _sumarizar(txs: list[Transaction]) -> dict[str, object]:
            total = sum(float(tx.amount) for tx in txs)
            por_categoria: dict[str, float] = {}
            for tx in txs:
                cat = tx.merchant_name or tx.description or "Outros"
                por_categoria[cat] = por_categoria.get(cat, 0.0) + float(tx.amount)
            top = sorted(por_categoria.items(), key=lambda x: x[1], reverse=True)[:5]
            return {
                "total": round(total, 2),
                "categorias_top": top,
                "n_transacoes": len(txs),
            }

        payload = {
            "semana_atual": _sumarizar(atual),
            "semana_anterior": _sumarizar(anterior),
            "dia_do_mes": today.day,
        }

        return [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    "Analise os dados financeiros da semana e gere o relatório:\n"
                    + json.dumps(payload, ensure_ascii=False)
                ),
            },
        ]

    def _parse_response(self, raw: str) -> AgentResult:
        if not raw:
            return AgentResult(content="Análise semanal indisponível no momento.")
        try:
            data: dict[str, object] = json.loads(raw)
            return AgentResult(
                content=str(data.get("insight_principal", "Análise semanal concluída.")),
                metadata=data,
            )
        except json.JSONDecodeError:
            return AgentResult(content="Análise semanal concluída.")
