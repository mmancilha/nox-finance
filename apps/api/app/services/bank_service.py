"""Lógica de negócio bancário: contas, transações e sincronização via Pluggy.

Tokens bancários SEMPRE encriptados via encrypt_token() — nunca armazenar
access_token em texto puro (.cursorrules inegociável).
"""

from __future__ import annotations

import uuid
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.security import encrypt_token
from app.models.bank_account import BankAccount
from app.models.transaction import Transaction
from app.services.pluggy_service import pluggy_service

log = get_logger(__name__)


class BankService:
    async def save_item_accounts(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        item_id: str,
        access_token: str,  # token bruto do Pluggy — será encriptado
    ) -> list[BankAccount]:
        """Chamado após o widget conectar um item.

        Busca as contas do item na Pluggy e salva no banco.
        O access_token é encriptado antes de persistir.
        Idempotente: se a conta já existe (pluggy_account_id), atualiza.
        """
        accounts_data = await pluggy_service.fetch_accounts(item_id)
        saved: list[BankAccount] = []

        for acc in accounts_data:
            pluggy_account_id: str = acc["id"]

            result = await db.execute(
                select(BankAccount).where(BankAccount.pluggy_account_id == pluggy_account_id)
            )
            bank_account = result.scalar_one_or_none()

            if bank_account is None:
                bank_account = BankAccount(
                    user_id=user_id,
                    pluggy_item_id=item_id,
                    pluggy_account_id=pluggy_account_id,
                )

            institution = acc.get("institution")
            bank_account.institution_name = (
                institution.get("name") if isinstance(institution, dict) else None
            )
            bank_account.account_type = acc.get("type")
            bank_account.account_number_masked = acc.get("number")
            bank_account.balance = Decimal(str(acc.get("balance") or 0))
            bank_account.access_token_encrypted = encrypt_token(access_token)
            bank_account.sync_status = "syncing"
            bank_account.is_active = True

            db.add(bank_account)
            saved.append(bank_account)

        await db.commit()
        log.info("bank_service.accounts_saved", count=len(saved), item_id=item_id)
        return saved

    async def sync_account_transactions(
        self,
        db: AsyncSession,
        bank_account_id: uuid.UUID,
        days_back: int = 90,
    ) -> int:
        """Sincroniza transações de uma conta. Retorna quantidade de novas transações.

        Idempotente via pluggy_transaction_id UNIQUE.
        """
        result = await db.execute(select(BankAccount).where(BankAccount.id == bank_account_id))
        account = result.scalar_one_or_none()
        if account is None or not account.is_active:
            log.warning("bank_service.sync.account_not_found", id=str(bank_account_id))
            return 0

        account.sync_status = "syncing"
        await db.commit()

        date_from = (date.today() - timedelta(days=days_back)).isoformat()
        date_to = date.today().isoformat()

        try:
            transactions_data = await pluggy_service.fetch_transactions(
                account_id=account.pluggy_account_id,
                date_from=date_from,
                date_to=date_to,
            )
        except Exception as exc:
            log.error("bank_service.sync.fetch_failed", error=str(exc))
            account.sync_status = "error"
            await db.commit()
            return 0

        new_count = 0
        for tx in transactions_data:
            pluggy_tx_id: str = tx["id"]

            existing = await db.execute(
                select(Transaction).where(Transaction.pluggy_transaction_id == pluggy_tx_id)
            )
            if existing.scalar_one_or_none() is not None:
                continue

            merchant = tx.get("merchant")
            merchant_name: str | None = merchant.get("name") if isinstance(merchant, dict) else None

            transaction = Transaction(
                user_id=account.user_id,
                bank_account_id=account.id,
                pluggy_transaction_id=pluggy_tx_id,
                amount=Decimal(str(tx.get("amount") or 0)),
                description=tx.get("description"),
                merchant_name=merchant_name,
                transaction_date=date.fromisoformat(str(tx["date"])[:10]),
                type=str(tx.get("type") or "DEBIT").upper(),
                is_recurring=False,
                tags=[],
            )
            db.add(transaction)
            new_count += 1

        account.sync_status = "synced"
        account.last_sync_at = datetime.now(UTC)
        await db.commit()

        log.info(
            "bank_service.sync.completed",
            account_id=str(bank_account_id),
            new_transactions=new_count,
        )
        return new_count

    async def mark_needs_reconnect(self, db: AsyncSession, item_id: str) -> None:
        """Marca todas as contas de um item como needs_reconnect."""
        result = await db.execute(select(BankAccount).where(BankAccount.pluggy_item_id == item_id))
        accounts = result.scalars().all()
        for acc in accounts:
            acc.sync_status = "needs_reconnect"
        await db.commit()
        log.warning("bank_service.item_needs_reconnect", item_id=item_id)


bank_service = BankService()
