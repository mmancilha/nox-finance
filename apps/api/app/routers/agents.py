"""Endpoints dos agentes Nox: chat (SSE) e consulta de insights.

NÃO usar `from __future__ import annotations` — FastAPI precisa resolver
anotações em runtime para injeção de dependências.
"""

import json
import uuid
from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.companheiro import Companheiro
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.agent_insight import AgentInsight
from app.models.user import User
from app.schemas.agent import AgentInsightResponse, ChatRequest

router = APIRouter(prefix="/agents", tags=["agents"])

_companheiro = Companheiro()  # singleton leve (sem estado)

VALID_AGENT_TYPES = {"sentinela", "oraculo", "norte", "companheiro"}


@router.post("/chat")
async def chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Chat com o Companheiro via Server-Sent Events.

    O cliente lê `data: {...}\\n\\n` até receber `data: [DONE]\\n\\n`.
    """
    history = [msg.model_dump() for msg in body.history]

    async def generate() -> AsyncGenerator[str, None]:
        async for chunk in _companheiro.stream_chat(
            message=body.message,
            user_id=current_user.id,
            db=db,
            history=history,
        ):
            yield f"data: {json.dumps({'content': chunk}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/insights", response_model=list[AgentInsightResponse])
async def list_insights(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AgentInsightResponse]:
    """Retorna os insights mais recentes do usuário (todos os agentes)."""
    result = await db.execute(
        select(AgentInsight)
        .where(AgentInsight.user_id == current_user.id)
        .order_by(AgentInsight.created_at.desc())
        .limit(min(limit, 100))
    )
    return [AgentInsightResponse.model_validate(i) for i in result.scalars().all()]


@router.get("/insights/{agent_type}", response_model=list[AgentInsightResponse])
async def list_insights_by_agent(
    agent_type: str,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AgentInsightResponse]:
    """Retorna insights de um agente específico."""
    if agent_type not in VALID_AGENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"agent_type deve ser um de: {sorted(VALID_AGENT_TYPES)}",
        )
    result = await db.execute(
        select(AgentInsight)
        .where(
            AgentInsight.user_id == current_user.id,
            AgentInsight.agent_type == agent_type,
        )
        .order_by(AgentInsight.created_at.desc())
        .limit(min(limit, 50))
    )
    return [AgentInsightResponse.model_validate(i) for i in result.scalars().all()]


@router.patch("/insights/{insight_id}/read", response_model=AgentInsightResponse)
async def mark_insight_read(
    insight_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AgentInsightResponse:
    """Marca um insight como lido."""
    result = await db.execute(
        select(AgentInsight).where(
            AgentInsight.id == insight_id,
            AgentInsight.user_id == current_user.id,
        )
    )
    insight = result.scalar_one_or_none()
    if insight is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insight não encontrado",
        )
    insight.is_read = True
    await db.commit()
    await db.refresh(insight)
    return AgentInsightResponse.model_validate(insight)
