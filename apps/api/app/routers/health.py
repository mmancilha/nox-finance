"""Health check. Usado pelo docker-compose e pelo deploy (Railway)."""

from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app import __version__
from app.core.database import get_db

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    version: str
    db: Literal["up", "down"]


@router.get("", response_model=HealthResponse)
async def health(db: AsyncSession = Depends(get_db)) -> HealthResponse:
    """Ping do serviço. Verifica latência do DB com `SELECT 1`."""
    db_status: Literal["up", "down"] = "up"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "down"

    return HealthResponse(
        status="ok" if db_status == "up" else "degraded",
        version=__version__,
        db=db_status,
    )
