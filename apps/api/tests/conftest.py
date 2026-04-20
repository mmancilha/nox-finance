"""Fixtures compartilhadas, cliente async + SQLite em memória."""

from collections.abc import AsyncGenerator, Iterator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.core.limiter import limiter as _limiter
from app.main import app
from app.models.base import Base


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
        await conn.run_sync(Base.metadata.create_all)

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
