"""Classe base para todos os agentes Nox.

Cada agente herda NoxAgent e implementa:
  - agent_type: str        — identificador único (snake_case)
  - model: str             — modelo OpenAI padrão
  - should_run()           — decide se deve rodar agora
  - _build_messages()      — monta lista de mensagens pro LLM
  - _parse_response()      — interpreta resposta e retorna AgentResult

A base cuida de: chamar OpenAI, tratar fallback, persistir AgentInsight,
controlar token budget.
"""

from __future__ import annotations

import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import UTC, datetime

from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionMessageParam
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.agent_insight import AgentInsight

log = get_logger(__name__)
settings = get_settings()


@dataclass
class AgentResult:
    """Resultado bruto de uma execução do agente, antes de persistir."""

    content: str  # texto do insight em pt-BR
    tokens_used: int = 0
    model_used: str = ""
    metadata: dict[str, object] = field(default_factory=dict)


class NoxAgent(ABC):
    """Interface comum a todos os agentes Nox.

    Subclasses DEVEM definir:
        name             = "Nome Amigável"   # exibido na UI
        agent_type       = "slug_do_agente"  # salvo no banco
        model            = settings.openai_model_mini  # ou _full
        monthly_token_budget = 50_000        # tokens por usuário/mês
    """

    name: str
    agent_type: str
    model: str
    monthly_token_budget: int = 50_000

    # ── Interface pública ─────────────────────────────────────────────────

    @abstractmethod
    async def should_run(self, user_id: uuid.UUID, db: AsyncSession) -> bool:
        """Retorna True se o agente deve rodar agora para este usuário."""

    @abstractmethod
    async def _build_messages(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
    ) -> list[ChatCompletionMessageParam]:
        """Monta a lista de mensagens para a chamada ao LLM."""

    @abstractmethod
    def _parse_response(self, raw: str) -> AgentResult:
        """Converte a string bruta da IA em AgentResult estruturado."""

    async def run(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
    ) -> AgentInsight | None:
        """Executa o agente end-to-end.

        Fluxo:
          1. Verifica budget mensal
          2. Chama should_run()
          3. Chama LLM com fallback
          4. Parseia resposta
          5. Persiste AgentInsight
          6. Retorna insight salvo (ou None se pulou)
        """
        if not await self.has_budget(user_id=user_id, db=db):
            log.warning(
                "agent.budget_exceeded",
                agent=self.agent_type,
                user_id=str(user_id),
            )
            return None

        if not await self.should_run(user_id=user_id, db=db):
            log.info("agent.skipped", agent=self.agent_type, user_id=str(user_id))
            return None

        messages = await self._build_messages(user_id=user_id, db=db)
        raw, tokens = await self._chat(messages)
        result = self._parse_response(raw)
        result.tokens_used = tokens
        result.model_used = self.model

        return await self._save_insight(user_id=user_id, db=db, result=result)

    # ── Helpers para subclasses ───────────────────────────────────────────

    async def _chat(
        self,
        messages: list[ChatCompletionMessageParam],
        *,
        json_mode: bool = False,
        temperature: float = 0.4,
    ) -> tuple[str, int]:
        """Chama OpenAI e retorna (content, tokens_used).

        Em caso de erro retorna ("", 0) — NUNCA levanta exceção.
        (.cursorrules: agentes sempre têm fallback.)
        """
        if not settings.openai_api_key:
            log.warning("agent.openai_key_missing", agent=self.agent_type)
            return "", 0

        client = AsyncOpenAI(api_key=settings.openai_api_key)

        try:
            if json_mode:
                response = await client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=temperature,
                    response_format={"type": "json_object"},
                )
            else:
                response = await client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=temperature,
                )
            content = response.choices[0].message.content or ""
            tokens = response.usage.total_tokens if response.usage else 0
            log.info(
                "agent.llm_call",
                agent=self.agent_type,
                tokens=tokens,
                model=self.model,
            )
            return content, tokens
        except Exception as exc:
            log.error("agent.llm_error", agent=self.agent_type, error=str(exc))
            return "", 0

    async def _save_insight(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        result: AgentResult,
    ) -> AgentInsight:
        """Persiste AgentInsight no banco e retorna o objeto salvo."""
        insight = AgentInsight(
            user_id=user_id,
            agent_type=self.agent_type,
            content=result.content,
            tokens_used=result.tokens_used,
            model_used=result.model_used,
            metadata_json=result.metadata,
        )
        db.add(insight)
        await db.commit()
        await db.refresh(insight)
        log.info(
            "agent.insight_saved",
            agent=self.agent_type,
            user_id=str(user_id),
            insight_id=str(insight.id),
        )
        return insight

    async def _get_monthly_tokens_used(self, user_id: uuid.UUID, db: AsyncSession) -> int:
        """Soma tokens usados pelo agente para o usuário no mês corrente."""
        now = datetime.now(UTC)
        result = await db.execute(
            select(func.coalesce(func.sum(AgentInsight.tokens_used), 0)).where(
                AgentInsight.user_id == user_id,
                AgentInsight.agent_type == self.agent_type,
                func.extract("year", AgentInsight.created_at) == now.year,
                func.extract("month", AgentInsight.created_at) == now.month,
            )
        )
        return int(result.scalar() or 0)

    async def has_budget(self, user_id: uuid.UUID, db: AsyncSession) -> bool:
        """True se tokens usados no mês < monthly_token_budget."""
        used = await self._get_monthly_tokens_used(user_id=user_id, db=db)
        return used < self.monthly_token_budget
