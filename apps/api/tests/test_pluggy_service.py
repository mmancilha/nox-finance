"""Testes unitários do PluggyService usando respx para mockar httpx."""

from __future__ import annotations

import httpx
import pytest
import respx

from app.services.pluggy_service import pluggy_service

_AUTH_URL = "https://api.pluggy.ai/auth"
_CONNECT_TOKEN_URL = "https://api.pluggy.ai/connect_token"
_ACCOUNTS_URL = "https://api.pluggy.ai/accounts"
_TRANSACTIONS_URL = "https://api.pluggy.ai/transactions"

_AUTH_RESPONSE = {"apiKey": "test-key", "expiresAt": "2099-01-01T00:00:00Z"}


@pytest.fixture(autouse=True)
def reset_pluggy_cache() -> None:
    """Reseta o cache de apiKey do singleton entre testes."""
    pluggy_service._api_key = None
    pluggy_service._api_key_expires_at = None
    yield  # type: ignore[misc]


@respx.mock
async def test_get_api_key_success() -> None:
    """_get_api_key autentica e retorna a chave correta."""
    respx.post(_AUTH_URL).mock(return_value=httpx.Response(200, json=_AUTH_RESPONSE))

    api_key = await pluggy_service._get_api_key()

    assert api_key == "test-key"


@respx.mock
async def test_get_api_key_cached() -> None:
    """Segunda chamada usa o cache — POST /auth executado apenas 1 vez."""
    auth_route = respx.post(_AUTH_URL).mock(return_value=httpx.Response(200, json=_AUTH_RESPONSE))

    first = await pluggy_service._get_api_key()
    second = await pluggy_service._get_api_key()

    assert first == second == "test-key"
    assert auth_route.call_count == 1


@respx.mock
async def test_create_connect_token() -> None:
    """create_connect_token retorna o accessToken do widget."""
    respx.post(_AUTH_URL).mock(return_value=httpx.Response(200, json=_AUTH_RESPONSE))
    respx.post(_CONNECT_TOKEN_URL).mock(
        return_value=httpx.Response(200, json={"accessToken": "widget-token"})
    )

    token = await pluggy_service.create_connect_token("user-123")

    assert token == "widget-token"


@respx.mock
async def test_fetch_accounts() -> None:
    """fetch_accounts retorna a lista de resultados da API."""
    respx.post(_AUTH_URL).mock(return_value=httpx.Response(200, json=_AUTH_RESPONSE))
    respx.get(_ACCOUNTS_URL).mock(
        return_value=httpx.Response(200, json={"results": [{"id": "acc-1"}]})
    )

    accounts = await pluggy_service.fetch_accounts("item-123")

    assert len(accounts) == 1
    assert accounts[0]["id"] == "acc-1"


@respx.mock
async def test_fetch_transactions_pagination() -> None:
    """fetch_transactions pagina automaticamente até obter todos os registros."""
    respx.post(_AUTH_URL).mock(return_value=httpx.Response(200, json=_AUTH_RESPONSE))

    page_1 = {"results": [{"id": str(i)} for i in range(10)], "total": 15}
    page_2 = {"results": [{"id": str(i)} for i in range(10, 15)], "total": 15}
    pages = [
        httpx.Response(200, json=page_1),
        httpx.Response(200, json=page_2),
    ]
    respx.get(_TRANSACTIONS_URL).mock(side_effect=lambda req: pages.pop(0))

    txs = await pluggy_service.fetch_transactions(
        account_id="acc-1",
        date_from="2024-01-01",
        date_to="2024-01-31",
    )

    assert len(txs) == 15
    assert txs[0]["id"] == "0"
    assert txs[14]["id"] == "14"
