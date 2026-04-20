"""Insight gerado por um agente Nox."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AgentInsight(Base):
    __tablename__ = "agent_insights"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    agent_type: Mapped[str] = mapped_column(
        String(30), nullable=False, index=True
    )  # "sentinela" | "oraculo" | "norte" | "companheiro"
    content: Mapped[str] = mapped_column(Text, nullable=False)  # insight em pt-BR
    tokens_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    model_used: Mapped[str] = mapped_column(String(50), default="", nullable=False)
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB, nullable=True
    )  # dados extras livres por agente
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(UTC), nullable=False, index=True
    )

    __table_args__ = (
        # Busca eficiente: insights de um user por agente, ordenados por data
        Index(
            "ix_agent_insights_user_agent_created",
            "user_id",
            "agent_type",
            "created_at",
        ),
    )
