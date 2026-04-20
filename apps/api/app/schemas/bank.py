"""Schemas Pydantic para contas bancárias, transações e Pluggy Connect."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ConnectTokenResponse(BaseModel):
    access_token: str  # token do Pluggy Connect Widget


class BankAccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    pluggy_item_id: str
    pluggy_account_id: str
    institution_name: str | None
    account_type: str | None
    account_number_masked: str | None
    balance: Decimal
    sync_status: str
    last_sync_at: datetime | None
    is_active: bool


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    pluggy_transaction_id: str
    amount: Decimal
    description: str | None
    merchant_name: str | None
    transaction_date: date
    type: str
    is_recurring: bool
    tags: list[str]
