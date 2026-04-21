"""Celery tasks dos agentes Nox.

Cada task chama asyncio.run() porque os agentes são async.
Sentinela: chamada do webhook após sync.
Oráculo/Norte: chamados pelo Beat schedule.
"""

from __future__ import annotations

import asyncio
import uuid
from typing import Any

from app.core.celery_app import celery_app
from app.core.database import get_async_session
from app.core.logging import get_logger

log = get_logger(__name__)


def _run_agent_for_user(agent_type: str, user_id_str: str) -> dict[str, Any]:
    """Helper síncrono que roda um agente para um usuário via asyncio.run()."""
    from app.agents.norte import Norte
    from app.agents.oraculo import Oraculo
    from app.agents.sentinela import Sentinela

    agents: dict[str, Any] = {
        "sentinela": Sentinela(),
        "oraculo": Oraculo(),
        "norte": Norte(),
    }

    agent = agents.get(agent_type)
    if agent is None:
        log.error("tasks.agents.unknown_type", agent_type=agent_type)
        return {"status": "error", "reason": "unknown_agent"}

    user_id = uuid.UUID(user_id_str)

    async def _run() -> dict[str, Any]:
        async with get_async_session() as db:
            insight = await agent.run(user_id=user_id, db=db)
            if insight is None:
                return {"status": "skipped", "agent": agent_type}
            return {
                "status": "ok",
                "agent": agent_type,
                "insight_id": str(insight.id),
                "tokens_used": insight.tokens_used,
            }

    return asyncio.run(_run())


@celery_app.task(bind=True, max_retries=2, default_retry_delay=120)
def run_sentinela(self: Any, user_id: str) -> dict[str, Any]:
    """Roda o Sentinela para um usuário específico (chamado após sync bancário)."""
    try:
        return _run_agent_for_user("sentinela", user_id)
    except Exception as exc:
        log.error("tasks.sentinela.error", user_id=user_id, error=str(exc))
        raise self.retry(exc=exc) from exc


@celery_app.task(bind=True, max_retries=2, default_retry_delay=300)
def run_oraculo_all_users(self: Any) -> dict[str, Any]:
    """Roda o Oráculo para todos os usuários com contas bancárias ativas."""
    from sqlalchemy import select

    from app.models.bank_account import BankAccount

    async def _get_user_ids() -> list[str]:
        async with get_async_session() as db:
            result = await db.execute(
                select(BankAccount.user_id)
                .where(
                    BankAccount.is_active.is_(True),
                    BankAccount.sync_status == "synced",
                )
                .distinct()
            )
            return [str(uid) for uid in result.scalars().all()]

    try:
        user_ids = asyncio.run(_get_user_ids())
        log.info("tasks.oraculo.starting", n_users=len(user_ids))
        results = [_run_agent_for_user("oraculo", uid) for uid in user_ids]
        ok = sum(1 for r in results if r.get("status") == "ok")
        return {"status": "ok", "processed": len(user_ids), "insights_gerados": ok}
    except Exception as exc:
        log.error("tasks.oraculo.error", error=str(exc))
        raise self.retry(exc=exc) from exc


@celery_app.task(bind=True, max_retries=2, default_retry_delay=300)
def run_norte_all_users(self: Any) -> dict[str, Any]:
    """Roda o Norte para todos os usuários com contas bancárias ativas."""
    from sqlalchemy import select

    from app.models.bank_account import BankAccount

    async def _get_user_ids() -> list[str]:
        async with get_async_session() as db:
            result = await db.execute(
                select(BankAccount.user_id).where(BankAccount.is_active.is_(True)).distinct()
            )
            return [str(uid) for uid in result.scalars().all()]

    try:
        user_ids = asyncio.run(_get_user_ids())
        log.info("tasks.norte.starting", n_users=len(user_ids))
        results = [_run_agent_for_user("norte", uid) for uid in user_ids]
        ok = sum(1 for r in results if r.get("status") == "ok")
        return {"status": "ok", "processed": len(user_ids), "insights_gerados": ok}
    except Exception as exc:
        log.error("tasks.norte.error", error=str(exc))
        raise self.retry(exc=exc) from exc
