"""Agente Companheiro — chat conversacional em pt-BR com streaming."""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator
from datetime import date

from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionMessageParam
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import AgentResult, NoxAgent
from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.transaction import Transaction

log = get_logger(__name__)
settings = get_settings()

SYSTEM_TEMPLATE = """\
Você é o Companheiro, o assistente financeiro pessoal do Nox.
Você é como um amigo esperto que entende de finanças — direto, empático, nunca julgador.
Sempre responde em português brasileiro, de forma natural e conversacional.
Nunca dê conselhos jurídicos ou de investimentos de alto risco.

Contexto financeiro atual do usuário:
- Gastos este mês: {gasto_mes}
- Transações este mês: {n_transacoes}
- Categorias com mais gasto: {top_categorias}

Use esse contexto quando relevante, mas não force o assunto se o usuário perguntar outra coisa.
"""


class Companheiro(NoxAgent):
    name = "Companheiro"
    agent_type = "companheiro"
    model = settings.openai_model_full  # gpt-4o
    monthly_token_budget = 200_000

    # ── Interface de streaming ────────────────────────────────────────────

    async def stream_chat(
        self,
        message: str,
        user_id: uuid.UUID,
        db: AsyncSession,
        history: list[dict[str, str]] | None = None,
    ) -> AsyncGenerator[str, None]:
        """Gera chunks de resposta via SSE. Persiste o insight ao final."""
        if not settings.openai_api_key:
            yield "Serviço de chat temporariamente indisponível."
            return

        system_prompt = await self._build_system_prompt(user_id=user_id, db=db)
        messages: list[ChatCompletionMessageParam] = [{"role": "system", "content": system_prompt}]

        # Histórico das últimas N mensagens (contexto da conversa)
        if history:
            for msg in history[-10:]:
                role = msg.get("role", "")
                content = msg.get("content", "")
                if role == "user":
                    messages.append({"role": "user", "content": content})
                elif role == "assistant":
                    messages.append({"role": "assistant", "content": content})

        messages.append({"role": "user", "content": message})

        client = AsyncOpenAI(api_key=settings.openai_api_key)
        full_response = ""
        tokens_used = 0

        try:
            stream = await client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                stream=True,
            )

            async for chunk in stream:
                delta = chunk.choices[0].delta.content if chunk.choices else None
                if delta:
                    full_response += delta
                    yield delta

            # Estimar tokens (stream não retorna usage por padrão)
            tokens_used = len(full_response.split()) * 2

        except Exception as exc:
            log.error("companheiro.stream_error", error=str(exc))
            yield "Desculpe, tive um problema técnico. Tente novamente em instantes."
            return

        # Persiste o insight ao final do stream
        try:
            result = AgentResult(
                content=full_response,
                tokens_used=tokens_used,
                model_used=self.model,
                metadata={"user_message": message},
            )
            await self._save_insight(user_id=user_id, db=db, result=result)
        except Exception as exc:
            log.warning("companheiro.save_insight_failed", error=str(exc))

    # ── NoxAgent abstract methods (necessários; usados pelo run() batch) ──

    async def should_run(self, user_id: uuid.UUID, db: AsyncSession) -> bool:
        return True  # Companheiro sempre pode rodar

    async def _build_messages(
        self, user_id: uuid.UUID, db: AsyncSession
    ) -> list[ChatCompletionMessageParam]:
        system_prompt = await self._build_system_prompt(user_id=user_id, db=db)
        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Dê um resumo financeiro breve do mês."},
        ]

    def _parse_response(self, raw: str) -> AgentResult:
        return AgentResult(content=raw or "Sem dados disponíveis no momento.")

    # ── Helpers privados ──────────────────────────────────────────────────

    async def _build_system_prompt(self, user_id: uuid.UUID, db: AsyncSession) -> str:
        today = date.today()
        primeiro_dia = today.replace(day=1)

        result = await db.execute(
            select(Transaction)
            .where(
                Transaction.user_id == user_id,
                Transaction.transaction_date >= primeiro_dia,
                Transaction.type == "DEBIT",
            )
            .limit(200)
        )
        transactions = list(result.scalars().all())

        gasto_total = sum(float(tx.amount) for tx in transactions)

        por_merchant: dict[str, float] = {}
        for tx in transactions:
            label = tx.merchant_name or tx.description or "Outros"
            por_merchant[label] = por_merchant.get(label, 0.0) + float(tx.amount)
        top3 = sorted(por_merchant.items(), key=lambda x: x[1], reverse=True)[:3]
        top_str = (
            ", ".join(
                f"{n} (R$ {v:,.2f})".replace(",", "X").replace(".", ",").replace("X", ".")
                for n, v in top3
            )
            or "sem dados"
        )

        return SYSTEM_TEMPLATE.format(
            gasto_mes=f"R$ {gasto_total:,.2f}".replace(",", "X")
            .replace(".", ",")
            .replace("X", "."),
            n_transacoes=len(transactions),
            top_categorias=top_str,
        )
