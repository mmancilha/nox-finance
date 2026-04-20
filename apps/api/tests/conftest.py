"""Fixtures compartilhadas, cliente async + SQLite em memória."""

from collections.abc import AsyncGenerator, Iterator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text

# JSONB é exclusivo do PostgreSQL. Para SQLite (testes) registramos um
# compilador de fallback que emite TEXT — o JSON serializado funciona igual.
from sqlalchemy.dialects.sqlite.base import SQLiteTypeCompiler
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.core.limiter import limiter as _limiter
from app.main import app
from app.models.base import Base

SQLiteTypeCompiler.visit_JSONB = lambda self, type_, **kw: "TEXT"

# Transaction usa ARRAY(String) que é exclusivo do PostgreSQL.
# agent_insights usa JSONB — com o patch acima funciona no SQLite.
_SQLITE_COMPATIBLE_TABLES = {
    "users",
    "sessions",
    "onboarding_progress",
    "bank_accounts",
    "categories",
    "agent_insights",
}


@pytest.fixture(autouse=True)
def reset_limiter() -> Iterator[None]:
    """Zera contadores do slowapi entre testes (storage em memória)."""
    _limiter.reset()
    yield


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """App FastAPI com BD SQLite isolado por teste."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )

    async with engine.connect() as conn:
        await conn.execute(text("PRAGMA foreign_keys=ON"))
        await conn.commit()

    async with engine.begin() as conn:
        await conn.run_sync(
            lambda c: Base.metadata.create_all(
                c,
                tables=[
                    t for t in Base.metadata.sorted_tables if t.name in _SQLITE_COMPATIBLE_TABLES
                ],
            )
        )

    test_session_factory = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with test_session_factory() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.fixture
async def auth_client(async_client: AsyncClient) -> AsyncClient:
    """Cliente HTTP autenticado com JWT de usuário registrado no DB de teste."""
    resp = await async_client.post(
        "/auth/register",
        json={
            "email": "agents-test@nox.dev",
            "password": "SenhaSegura123!",
            "name": "Agente Test User",
        },
    )
    assert resp.status_code == 201, f"Registro falhou: {resp.text}"
    token = resp.json()["access_token"]
    async_client.headers["Authorization"] = f"Bearer {token}"
    return async_client
