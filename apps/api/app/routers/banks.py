"""Endpoints REST para contas bancárias e transações.

Nota: NÃO usar `from __future__ import annotations` — FastAPI precisa
resolver as anotações em tempo de execução para injeção de dependências.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.bank_account import BankAccount
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.bank import (
    BankAccountResponse,
    ConnectTokenResponse,
    TransactionResponse,
    TransactionsListResponse,
)
from app.services.bank_service import bank_service
from app.services.pluggy_service import pluggy_service
from app.tasks.sync_transactions import sync_account

router = APIRouter(prefix="/banks", tags=["banks"])


@router.get("/connect-token", response_model=ConnectTokenResponse)
async def get_connect_token(
    current_user: User = Depends(get_current_user),
) -> ConnectTokenResponse:
    """Gera connect token para o Pluggy Widget no frontend."""
    token = await pluggy_service.create_connect_token(str(current_user.id))
    return ConnectTokenResponse(access_token=token)


@router.post("/items/{item_id}", response_model=list[BankAccountResponse])
async def connect_item(
    item_id: str,
    access_token: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BankAccountResponse]:
    """Chamado pelo frontend após o widget conectar com sucesso.

    Salva contas e agenda sync inicial.
    """
    accounts = await bank_service.save_item_accounts(
        db=db,
        user_id=current_user.id,
        item_id=item_id,
        access_token=access_token,
    )
    for acc in accounts:
        sync_account.delay(str(acc.id), days_back=90)

    return [BankAccountResponse.model_validate(a) for a in accounts]


@router.get("/accounts", response_model=list[BankAccountResponse])
async def list_accounts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BankAccountResponse]:
    """Lista contas bancárias conectadas do usuário."""
    result = await db.execute(
        select(BankAccount).where(
            BankAccount.user_id == current_user.id,
            BankAccount.is_active.is_(True),
        )
    )
    return [BankAccountResponse.model_validate(a) for a in result.scalars().all()]


@router.get(
    "/accounts/{account_id}/transactions",
    response_model=TransactionsListResponse,
)
async def list_transactions(
    account_id: uuid.UUID,
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TransactionsListResponse:
    """Lista transações de uma conta com paginação."""
    filters = (
        Transaction.bank_account_id == account_id,
        Transaction.user_id == current_user.id,
    )
    count_result = await db.execute(select(func.count()).select_from(Transaction).where(*filters))
    total = int(count_result.scalar_one() or 0)

    result = await db.execute(
        select(Transaction)
        .where(*filters)
        .order_by(Transaction.transaction_date.desc())
        .limit(limit)
        .offset(offset)
    )
    rows = [TransactionResponse.model_validate(t) for t in result.scalars().all()]
    return TransactionsListResponse(transactions=rows, total=total)


@router.post("/accounts/{account_id}/sync", status_code=status.HTTP_202_ACCEPTED)
async def trigger_sync(
    account_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Agenda sync manual de uma conta. Retorna 202 Accepted."""
    result = await db.execute(
        select(BankAccount).where(
            BankAccount.id == account_id,
            BankAccount.user_id == current_user.id,
        )
    )
    account = result.scalar_one_or_none()
    if account is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada",
        )

    sync_account.delay(str(account_id))
    return {"status": "sync_enqueued", "account_id": str(account_id)}
