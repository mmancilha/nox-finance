"""Conta bancária vinculada via Pluggy (Open Finance Brasil)."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    pluggy_item_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    pluggy_account_id: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    institution_name: Mapped[str | None] = mapped_column(String(100))
    account_type: Mapped[str | None] = mapped_column(
        String(30)
    )  # "CHECKING" | "SAVINGS" | "CREDIT"
    account_number_masked: Mapped[str | None] = mapped_column(String(20))
    access_token_encrypted: Mapped[str | None] = mapped_column(
        Text
    )  # AES-256-GCM via encrypt_token()
    balance: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    last_sync_at: Mapped[datetime | None] = mapped_column(nullable=True)
    sync_status: Mapped[str] = mapped_column(
        String(20), default="pending"
    )  # "pending" | "syncing" | "synced" | "error" | "needs_reconnect"
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(UTC))
