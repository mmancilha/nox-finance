"""Celery task: sincronização de transações bancárias via Pluggy.

NUNCA chamar Pluggy/OpenAI direto no request do usuário — usar esta task.
"""

import asyncio
import uuid
from typing import Any

from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.core.logging import get_logger
from app.services.bank_service import bank_service

log = get_logger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def sync_account(self: Any, bank_account_id: str, days_back: int = 90) -> dict[str, int | str]:
    """Sincroniza transações de uma conta bancária.

    Chamada pelo webhook Pluggy ou manualmente via router.
    """

    async def _run() -> int:
        async with SessionLocal() as db:
            return await bank_service.sync_account_transactions(
                db=db,
                bank_account_id=uuid.UUID(bank_account_id),
                days_back=days_back,
            )

    try:
        new_count = asyncio.run(_run())
        log.info("task.sync_account.done", account_id=bank_account_id, new=new_count)
        return {"account_id": bank_account_id, "new_transactions": new_count}
    except Exception as exc:
        log.error("task.sync_account.failed", account_id=bank_account_id, error=str(exc))
        raise self.retry(exc=exc) from exc
