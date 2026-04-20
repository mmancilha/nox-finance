"""Endpoints de autenticação (cadastro, login, refresh, perfil).

Nota: NÃO usar `from __future__ import annotations` aqui, o slowapi
envolve cada endpoint em um wrapper cujo módulo não conhece nossos
símbolos, então as anotações em string ficam como ForwardRef não
resolvido e o FastAPI deixa de reconhecer o body Pydantic.
"""

from typing import Annotated

from fastapi import APIRouter, Body, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.limiter import limiter
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UpdateMeRequest,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
auth_service = AuthService()


def _expires_seconds() -> int:
    return get_settings().access_token_expire_minutes * 60


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=RegisterResponse)
@limiter.limit("5/hour")
async def register(
    request: Request,
    response: Response,
    req: Annotated[RegisterRequest, Body()],
    db: AsyncSession = Depends(get_db),
) -> RegisterResponse:
    user, access, refresh_raw = await auth_service.register(db, req)
    return RegisterResponse(
        access_token=access,
        refresh_token=refresh_raw,
        expires_in=_expires_seconds(),
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(
    request: Request,
    response: Response,
    req: Annotated[LoginRequest, Body()],
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    _user, access, refresh_raw = await auth_service.login(db, req)
    return TokenResponse(
        access_token=access,
        refresh_token=refresh_raw,
        expires_in=_expires_seconds(),
    )


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("30/minute")
async def refresh_tokens(
    request: Request,
    response: Response,
    req: Annotated[RefreshRequest, Body()],
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    access, refresh_raw = await auth_service.refresh(db, req)
    return TokenResponse(
        access_token=access,
        refresh_token=refresh_raw,
        expires_in=_expires_seconds(),
    )


@router.get("/me", response_model=UserResponse)
@limiter.limit("60/minute")
async def me(
    request: Request,
    response: Response,
    current: User = Depends(get_current_user),
) -> UserResponse:
    return UserResponse.model_validate(current)


@router.patch("/me", response_model=UserResponse)
@limiter.limit("20/minute")
async def update_me(
    request: Request,
    response: Response,
    req: Annotated[UpdateMeRequest, Body()],
    current: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    updated = await auth_service.update_me(db, current, req)
    return UserResponse.model_validate(updated)
