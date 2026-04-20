"""Testes da API de autenticação (SQLite async em memória)."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.fixture
def register_payload() -> dict[str, str]:
    return {
        "email": "nox-test@nox.dev",
        "password": "SenhaSegura123!",
        "name": "Usuário Teste",
    }


@pytest.mark.asyncio
async def test_register_success(
    async_client: AsyncClient,
    register_payload: dict[str, str],
) -> None:
    resp = await async_client.post("/auth/register", json=register_payload)
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data.get("token_type") == "bearer"
    assert isinstance(data.get("expires_in"), int)
    assert data["expires_in"] > 0
    user = data["user"]
    assert user["email"] == register_payload["email"]
    assert user["name"] == register_payload["name"]
    assert user["plan"] == "free"
    assert "id" in user


@pytest.mark.asyncio
async def test_register_duplicate_email(
    async_client: AsyncClient,
    register_payload: dict[str, str],
) -> None:
    r1 = await async_client.post("/auth/register", json=register_payload)
    assert r1.status_code == 201
    r2 = await async_client.post("/auth/register", json=register_payload)
    assert r2.status_code == 409


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient, register_payload: dict[str, str]) -> None:
    await async_client.post("/auth/register", json=register_payload)
    resp = await async_client.post(
        "/auth/login",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("token_type") == "bearer"
    assert "access_token" in data and "refresh_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(
    async_client: AsyncClient,
    register_payload: dict[str, str],
) -> None:
    await async_client.post("/auth/register", json=register_payload)
    resp = await async_client.post(
        "/auth/login",
        json={"email": register_payload["email"], "password": "OutraSenha999!"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_authenticated(
    async_client: AsyncClient,
    register_payload: dict[str, str],
) -> None:
    reg = await async_client.post("/auth/register", json=register_payload)
    token = reg.json()["access_token"]
    me = await async_client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    body = me.json()
    assert body["email"] == register_payload["email"]


@pytest.mark.asyncio
async def test_me_no_token(async_client: AsyncClient) -> None:
    resp = await async_client.get("/auth/me")
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_refresh_token(async_client: AsyncClient, register_payload: dict[str, str]) -> None:
    reg = await async_client.post("/auth/register", json=register_payload)
    refresh = reg.json()["refresh_token"]
    resp = await async_client.post("/auth/refresh", json={"refresh_token": refresh})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data and "refresh_token" in data
    assert data["refresh_token"] != refresh


@pytest.mark.asyncio
async def test_update_me_full_payload(
    async_client: AsyncClient,
    register_payload: dict[str, str],
) -> None:
    reg = await async_client.post("/auth/register", json=register_payload)
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "preferred_name": "May",
        "avatar_emoji": "🌙",
        "risk_profile": "moderado",
    }
    resp = await async_client.patch("/auth/me", json=payload, headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "May"
    assert body["email"] == register_payload["email"]


@pytest.mark.asyncio
async def test_update_me_partial_keeps_name(
    async_client: AsyncClient,
    register_payload: dict[str, str],
) -> None:
    reg = await async_client.post("/auth/register", json=register_payload)
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = await async_client.patch(
        "/auth/me",
        json={"risk_profile": "arrojado"},
        headers=headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == register_payload["name"]


@pytest.mark.asyncio
async def test_update_me_invalid_risk_profile(
    async_client: AsyncClient,
    register_payload: dict[str, str],
) -> None:
    reg = await async_client.post("/auth/register", json=register_payload)
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = await async_client.patch(
        "/auth/me",
        json={"risk_profile": "agressivo"},
        headers=headers,
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_update_me_no_token(async_client: AsyncClient) -> None:
    resp = await async_client.patch("/auth/me", json={"preferred_name": "X"})
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_login_rate_limit(async_client: AsyncClient) -> None:
    """11 tentativas de login devem resultar em 429 na última."""
    await async_client.post(
        "/auth/register",
        json={
            "email": "ratelimit@nox.dev",
            "name": "Rate Test",
            "password": "senha12345",
        },
    )
    for _ in range(10):
        await async_client.post(
            "/auth/login",
            json={"email": "ratelimit@nox.dev", "password": "errada"},
        )
    response = await async_client.post(
        "/auth/login",
        json={"email": "ratelimit@nox.dev", "password": "errada"},
    )
    assert response.status_code == 429
