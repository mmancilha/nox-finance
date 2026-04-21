"""Schemas Pydantic para endpoints de agentes."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Mensagem individual no histórico do chat."""

    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    """Payload de entrada para POST /agents/chat."""

    message: str = Field(..., min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)


class AgentInsightResponse(BaseModel):
    """Resposta serializada de um AgentInsight."""

    id: uuid.UUID
    agent_type: str
    content: str
    tokens_used: int
    model_used: str
    metadata_json: dict[str, Any] | None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
