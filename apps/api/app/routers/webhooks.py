"""Webhook Pluggy (Open Finance Brasil).

Idempotente por design — o Pluggy pode enviar o mesmo evento N vezes.
Sempre retorna 200 para evitar retentativas desnecessárias.
NUNCA logar tokens ou dados bancários.
"""

import hashlib
import hmac

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.logging import get_logger
from app.models.bank_account import BankAccount
from app.schemas.webhook import PluggyWebhookPayload
from app.services.bank_service import bank_service
from app.tasks.agents import run_sentinela
from app.tasks.sync_transactions import sync_account

log = get_logger(__name__)
router = APIRouter(prefix="/webhook", tags=["webhooks"])


async def verify_pluggy_signature(
    request: Request,
    x_pluggy_request_id: str | None = Header(default=None),
) -> None:
    """Verifica assinatura HMAC-SHA256 do webhook Pluggy.

    Se PLUGGY_WEBHOOK_SECRET estiver vazio, pula verificação (dev).
    """
    settings = get_settings()
    if not settings.pluggy_webhook_secret:
        log.warning("webhook.signature_check_skipped — set PLUGGY_WEBHOOK_SECRET in prod")
        return

    signature_header = request.headers.get("x-pluggy-signature", "")
    body = await request.body()
    expected = hmac.new(
        settings.pluggy_webhook_secret.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature_header, expected):
        log.warning("webhook.invalid_signature")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Assinatura inválida",
        )


@router.post("/pluggy", status_code=status.HTTP_200_OK)
async def pluggy_webhook(
    payload: PluggyWebhookPayload,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(verify_pluggy_signature),
) -> dict[str, bool]:
    """Recebe eventos do Pluggy. Idempotente — pode receber o mesmo evento N vezes."""
    log.info("webhook.pluggy.received", evt=payload.event, item_id=payload.itemId)

    if payload.event in ("item/updated", "item/created"):
        result = await db.execute(
            select(BankAccount).where(
                BankAccount.pluggy_item_id == payload.itemId,
                BankAccount.is_active.is_(True),
            )
        )
        accounts = result.scalars().all()

        for account in accounts:
            sync_account.delay(str(account.id))
            run_sentinela.delay(str(account.user_id))
            log.info("webhook.sync_enqueued", account_id=str(account.id))

    elif payload.event == "item/error":
        await bank_service.mark_needs_reconnect(db, payload.itemId)

    return {"received": True}
