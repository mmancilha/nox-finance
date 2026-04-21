"""Serviço de integração com a Pluggy (Open Finance Brasil).

Encapsula autenticação, cache de apiKey e paginação automática de transações.
NUNCA logue apiKey, clientSecret ou access tokens bancários.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta
from typing import Any, ClassVar

import httpx

from app.core.config import get_settings
from app.core.logging import get_logger

log = get_logger(__name__)


class PluggyService:
    """Cliente HTTP para a API Pluggy com cache de apiKey e paginação automática."""

    _lock: ClassVar[asyncio.Lock] = asyncio.Lock()

    def __init__(self) -> None:
        self._api_key: str | None = None
        self._api_key_expires_at: datetime | None = None

    async def _get_api_key(self) -> str:
        """Retorna apiKey válida, renovando se necessário. Thread-safe."""
        async with self._lock:
            now = datetime.now(UTC)
            if (
                self._api_key is not None
                and self._api_key_expires_at is not None
                and now < self._api_key_expires_at - timedelta(minutes=5)
            ):
                return self._api_key

            settings = get_settings()
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{settings.pluggy_base_url}/auth",
                    json={
                        "clientId": settings.pluggy_client_id,
                        "clientSecret": settings.pluggy_client_secret,
                    },
                    timeout=10.0,
                )
                resp.raise_for_status()
                data: dict[str, Any] = resp.json()

            api_key = str(data["apiKey"])
            self._api_key = api_key

            expires_str = str(data.get("expiresAt") or "")
            if expires_str:
                self._api_key_expires_at = datetime.fromisoformat(
                    expires_str.replace("Z", "+00:00")
                )
            else:
                self._api_key_expires_at = now + timedelta(hours=2)

            # NUNCA logar o apiKey
            log.info("pluggy.auth.refreshed")
            return api_key

    async def _headers(self) -> dict[str, str]:
        return {"X-API-KEY": await self._get_api_key()}

    async def create_connect_token(self, user_id: str) -> str:
        """Cria um connect token para o Pluggy Connect Widget."""
        settings = get_settings()
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{settings.pluggy_base_url}/connect_token",
                json={"clientUserId": user_id},
                headers=await self._headers(),
                timeout=10.0,
            )
            resp.raise_for_status()
            data: dict[str, Any] = resp.json()
        return str(data["accessToken"])

    async def fetch_accounts(self, item_id: str) -> list[dict[str, Any]]:
        """Lista contas de um item Pluggy."""
        settings = get_settings()
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{settings.pluggy_base_url}/accounts",
                params={"itemId": item_id},
                headers=await self._headers(),
                timeout=15.0,
            )
            resp.raise_for_status()
            data: dict[str, Any] = resp.json()
        return list(data.get("results") or [])

    async def fetch_transactions(
        self,
        account_id: str,
        date_from: str,  # YYYY-MM-DD
        date_to: str,  # YYYY-MM-DD
        page_size: int = 500,
    ) -> list[dict[str, Any]]:
        """Lista transações de uma conta. Pagina automaticamente."""
        settings = get_settings()
        all_txs: list[dict[str, Any]] = []
        page = 1

        async with httpx.AsyncClient() as client:
            while True:
                resp = await client.get(
                    f"{settings.pluggy_base_url}/transactions",
                    params={
                        "accountId": account_id,
                        "from": date_from,
                        "to": date_to,
                        "pageSize": page_size,
                        "page": page,
                    },
                    headers=await self._headers(),
                    timeout=20.0,
                )
                resp.raise_for_status()
                data: dict[str, Any] = resp.json()
                results: list[dict[str, Any]] = list(data.get("results") or [])
                all_txs.extend(results)

                total = int(data.get("total") or 0)
                if len(all_txs) >= total or not results:
                    break
                page += 1

        return all_txs

    async def fetch_item(self, item_id: str) -> dict[str, Any]:
        """Retorna status de um item Pluggy."""
        settings = get_settings()
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{settings.pluggy_base_url}/items/{item_id}",
                headers=await self._headers(),
                timeout=10.0,
            )
            resp.raise_for_status()
            data: dict[str, Any] = resp.json()
        return data


# Singleton compartilhado (o cache de apiKey fica na instância)
pluggy_service = PluggyService()
