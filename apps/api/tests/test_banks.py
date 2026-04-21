"""Testes dos endpoints de bancos e webhook Pluggy."""

import uuid
from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.main import app
from app.models.user import User

# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def fake_user() -> User:
    """Usuário falso para testes sem precisar do banco."""
    user = User()
    user.id = uuid.uuid4()
    user.email = "test@nox.finance"
    user.is_active = True
    user.name = "Test User"
    return user


@pytest.fixture
async def bank_client(fake_user: User) -> AsyncGenerator[AsyncClient, None]:
    """Client autenticado com sessão DB mockada (resultados vazios por padrão)."""
    result_mock = MagicMock()
    result_mock.scalars.return_value.all.return_value = []
    result_mock.scalar_one_or_none.return_value = None
    result_mock.scalar_one.return_value = 0  # COUNT(*) em list_transactions

    session = AsyncMock(spec=AsyncSession)
    session.execute = AsyncMock(return_value=result_mock)
    session.commit = AsyncMock()

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield session

    app.dependency_overrides[get_current_user] = lambda: fake_user
    app.dependency_overrides[get_db] = _override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


# ── Tests — REST /banks ────────────────────────────────────────────────────────


async def test_get_connect_token(bank_client: AsyncClient) -> None:
    """GET /banks/connect-token retorna o token para o widget."""
    with patch(
        "app.routers.banks.pluggy_service.create_connect_token",
        new=AsyncMock(return_value="widget-token"),
    ):
        resp = await bank_client.get("/banks/connect-token")

    assert resp.status_code == 200
    assert resp.json() == {"access_token": "widget-token"}


async def test_get_connect_token_unauthenticated(async_client: AsyncClient) -> None:
    """GET /banks/connect-token sem auth retorna 403."""
    resp = await async_client.get("/banks/connect-token")
    assert resp.status_code == 403


async def test_list_accounts_empty(bank_client: AsyncClient) -> None:
    """GET /banks/accounts retorna lista vazia quando não há contas."""
    resp = await bank_client.get("/banks/accounts")
    assert resp.status_code == 200
    assert resp.json() == []


async def test_list_transactions_empty(bank_client: AsyncClient) -> None:
    """GET /banks/accounts/{id}/transactions retorna lista vazia e total 0."""
    account_id = uuid.uuid4()
    resp = await bank_client.get(f"/banks/accounts/{account_id}/transactions")
    assert resp.status_code == 200
    assert resp.json() == {"transactions": [], "total": 0}


async def test_trigger_sync_not_found(bank_client: AsyncClient) -> None:
    """POST /banks/accounts/{id}/sync com conta inexistente retorna 404."""
    account_id = uuid.uuid4()
    resp = await bank_client.post(f"/banks/accounts/{account_id}/sync")
    assert resp.status_code == 404


# ── Tests — Webhook /webhook/pluggy ───────────────────────────────────────────


async def test_webhook_item_updated_no_accounts(async_client: AsyncClient) -> None:
    """Webhook item/updated sem contas cadastradas retorna 200 e não enfileira tasks."""
    with patch("app.routers.webhooks.sync_account") as mock_task:
        mock_task.delay = MagicMock()
        resp = await async_client.post(
            "/webhook/pluggy",
            json={"event": "item/updated", "itemId": "item-123"},
        )

    assert resp.status_code == 200
    assert resp.json() == {"received": True}
    mock_task.delay.assert_not_called()


async def test_webhook_item_error(async_client: AsyncClient) -> None:
    """Webhook item/error chama mark_needs_reconnect e retorna 200."""
    with patch(
        "app.routers.webhooks.bank_service.mark_needs_reconnect",
        new=AsyncMock(),
    ) as mock_reconnect:
        resp = await async_client.post(
            "/webhook/pluggy",
            json={"event": "item/error", "itemId": "item-456"},
        )

    assert resp.status_code == 200
    assert resp.json() == {"received": True}
    mock_reconnect.assert_called_once()
