"""Endpoints de autenticação (cadastro, login, refresh, perfil)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
auth_service = AuthService()


def _expires_seconds() -> int:
    return get_settings().access_token_expire_minutes * 60


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=RegisterResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)) -> RegisterResponse:
    user, access, refresh_raw = await auth_service.register(db, req)
    return RegisterResponse(
        access_token=access,
        refresh_token=refresh_raw,
        expires_in=_expires_seconds(),
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    _user, access, refresh_raw = await auth_service.login(db, req)
    return TokenResponse(
        access_token=access,
        refresh_token=refresh_raw,
        expires_in=_expires_seconds(),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(req: RefreshRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    access, refresh_raw = await auth_service.refresh(db, req)
    return TokenResponse(
        access_token=access,
        refresh_token=refresh_raw,
        expires_in=_expires_seconds(),
    )


@router.get("/me", response_model=UserResponse)
async def me(current: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current)
