"""Agente Sentinela — vigilância de transações em tempo real."""

from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime, timedelta

from openai.types.chat import ChatCompletionMessageParam
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import AgentResult, NoxAgent
from app.core.config import get_settings
from app.models.transaction import Transaction

settings = get_settings()

SYSTEM_PROMPT = """\
Você é o Sentinela, agente de vigilância financeira do Nox.
Analise as transações recentes e identifique APENAS problemas reais:
1. Duplicatas (mesma descrição/merchant, valor idêntico ou próximo, intervalo < 3 dias)
2. Assinaturas esquecidas (débito recorrente de serviço pouco usado: Netflix, Spotify, apps)
3. Anomalias (gasto 3x acima da média histórica em uma categoria)

Regras obrigatórias:
- Responda SOMENTE com JSON válido, sem markdown.
- Se não houver nada suspeito, retorne lista anomalias vazia.
- Linguagem sempre em português brasileiro.
- Valores no formato "R$ X.XXX,XX".

Schema de resposta:
{
  "anomalias": [
    {"tipo": "duplicata|assinatura|anomalia", "descricao": "...", "valor": "R$ X,XX", "acao": "..."}
  ],
  "resumo": "Notei que... (string pt-BR, max 150 chars)",
  "tem_alertas": true|false
}
"""


class Sentinela(NoxAgent):
    name = "Sentinela"
    agent_type = "sentinela"
    model = settings.openai_model_mini  # gpt-4o-mini
    monthly_token_budget = 80_000

    async def should_run(self, user_id: uuid.UUID, db: AsyncSession) -> bool:
        """Roda se há transações novas nas últimas 48h."""
        cutoff = datetime.now(UTC) - timedelta(hours=48)
        result = await db.execute(
            select(Transaction.id)
            .where(
                Transaction.user_id == user_id,
                Transaction.created_at >= cutoff,
            )
            .limit(1)
        )
        return result.scalar_one_or_none() is not None

    async def _build_messages(
        self, user_id: uuid.UUID, db: AsyncSession
    ) -> list[ChatCompletionMessageParam]:
        cutoff = datetime.now(UTC) - timedelta(hours=48)
        result = await db.execute(
            select(Transaction)
            .where(
                Transaction.user_id == user_id,
                Transaction.created_at >= cutoff,
            )
            .order_by(Transaction.transaction_date.desc())
            .limit(50)
        )
        transactions = result.scalars().all()

        tx_list = [
            {
                "data": str(tx.transaction_date),
                "descricao": tx.description or tx.merchant_name or "Sem descrição",
                "valor": (
                    f"R$ {tx.amount:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
                ),
                "tipo": tx.type,
                "recorrente": tx.is_recurring,
            }
            for tx in transactions
        ]

        return [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Analise estas {len(tx_list)} transações recentes (últimas 48h):\n"
                    + json.dumps(tx_list, ensure_ascii=False)
                ),
            },
        ]

    def _parse_response(self, raw: str) -> AgentResult:
        if not raw:
            return AgentResult(
                content="Nenhuma anomalia detectada nas últimas 48h.",
                metadata={"tem_alertas": False, "anomalias": []},
            )
        try:
            data: dict[str, object] = json.loads(raw)
            return AgentResult(
                content=str(data.get("resumo", "Monitoramento concluído.")),
                metadata=data,
            )
        except json.JSONDecodeError:
            return AgentResult(
                content="Monitoramento concluído.",
                metadata={"tem_alertas": False, "anomalias": []},
            )
