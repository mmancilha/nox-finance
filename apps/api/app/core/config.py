"""Configuração central do Nox API.

Tudo vem de variáveis de ambiente. Em dev lê do .env na raiz do monorepo.
Nunca commitar secrets — use sempre `.env.example` como fonte da verdade.
"""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Raiz do monorepo (4 níveis acima deste arquivo):
#   apps/api/app/core/config.py  →  raiz
ROOT_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    """Config do backend. Use `get_settings()` para acessar."""

    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ─────────────────────────────────────────
    environment: Literal["development", "staging", "production"] = Field(
        default="development", alias="NODE_ENV"
    )
    app_url: str = Field(default="http://localhost:3000", alias="NEXT_PUBLIC_APP_URL")
    api_url: str = Field(default="http://localhost:8000", alias="NEXT_PUBLIC_API_URL")

    # ── Database ────────────────────────────────────
    database_url: str = Field(
        default="postgresql+asyncpg://nox:nox_dev@localhost:5432/nox",
        alias="DATABASE_URL",
    )
    database_echo: bool = Field(default=False, alias="DATABASE_ECHO")

    # ── Redis / Celery ──────────────────────────────
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    celery_broker_url: str | None = Field(default=None, alias="CELERY_BROKER_URL")
    celery_result_backend: str | None = Field(default=None, alias="CELERY_RESULT_BACKEND")

    # ── Auth ────────────────────────────────────────
    nextauth_secret: str = Field(default="dev-secret-change-me", alias="NEXTAUTH_SECRET")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_access_ttl_minutes: int = Field(default=30, alias="JWT_ACCESS_TTL_MINUTES")
    jwt_refresh_ttl_days: int = Field(default=14, alias="JWT_REFRESH_TTL_DAYS")

    # ── Encryption (tokens bancários) ───────────────
    encryption_key: str = Field(
        default="change-me-32-bytes-for-dev-only-!!",
        alias="ENCRYPTION_KEY",
        description="AES-256 key em base64. 32 bytes após decodificar.",
    )

    # ── Integrações externas ────────────────────────
    pluggy_client_id: str | None = Field(default=None, alias="PLUGGY_CLIENT_ID")
    pluggy_client_secret: str | None = Field(default=None, alias="PLUGGY_CLIENT_SECRET")
    pluggy_webhook_secret: str | None = Field(default=None, alias="PLUGGY_WEBHOOK_SECRET")

    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    openai_model_mini: str = Field(default="gpt-4o-mini", alias="OPENAI_MODEL_MINI")
    openai_model_full: str = Field(default="gpt-4o", alias="OPENAI_MODEL_FULL")

    resend_api_key: str | None = Field(default=None, alias="RESEND_API_KEY")

    sentry_dsn: str | None = Field(default=None, alias="SENTRY_DSN")

    # ── CORS ────────────────────────────────────────
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        alias="CORS_ORIGINS",
    )

    @property
    def broker_url(self) -> str:
        return self.celery_broker_url or self.redis_url

    @property
    def result_backend(self) -> str:
        return self.celery_result_backend or self.redis_url

    @property
    def is_dev(self) -> bool:
        return self.environment == "development"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Instância única das settings. Cacheada porque lê do disco."""
    return Settings()
