"""Entrypoint FastAPI do Nox API.

Roda com:
    poetry run uvicorn app.main:app --reload
"""

from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from typing import cast

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app import __version__
from app.core.config import get_settings
from app.core.limiter import limiter
from app.core.logging import configure_logging, get_logger
from app.routers import auth, health

configure_logging()
log = get_logger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    log.info("app.startup", env=settings.environment, version=__version__)
    yield
    log.info("app.shutdown")


app = FastAPI(
    title="Nox API",
    version=__version__,
    description="Backend do Nox, 4 agentes financeiros autônomos.",
    docs_url="/docs" if settings.is_dev else None,
    redoc_url="/redoc" if settings.is_dev else None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    cast(
        Callable[[Request, Exception], Response | Awaitable[Response]],
        _rate_limit_exceeded_handler,
    ),
)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)


@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    """Hello world em pt-BR para confirmar que subiu."""
    return {
        "app": "Nox API",
        "version": __version__,
        "mensagem": "Enquanto você dorme, eu cuido do seu dinheiro.",
    }
