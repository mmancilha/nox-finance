"""Schemas Pydantic v2 — autenticação."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    name: str | None
    avatar_url: str | None
    plan: str
    created_at: datetime


class RegisterResponse(BaseModel):
    """Resposta do cadastro: tokens + perfil."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class UpdateMeRequest(BaseModel):
    """Atualização parcial do perfil — usado pelo onboarding."""

    preferred_name: str | None = None
    avatar_emoji: str | None = None
    risk_profile: Literal["conservador", "moderado", "arrojado"] | None = None
