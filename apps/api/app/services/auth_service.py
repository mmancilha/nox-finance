"""Lógica de negócio — cadastro, login e refresh token."""

from __future__ import annotations

import hashlib
from datetime import UTC, datetime, timedelta

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import create_access_token, create_refresh_token
from app.models.onboarding import OnboardingProgress
from app.models.session import Session as AuthSessionRow
from app.models.user import User
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest

ph = PasswordHasher()


class AuthService:
    """Autenticação e sessões com Argon2 + JWT."""

    async def register(
        self,
        db: AsyncSession,
        req: RegisterRequest,
    ) -> tuple[User, str, str]:
        existing = await db.execute(select(User).where(User.email == req.email))
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="E-mail já cadastrado",
            )

        password_hash = ph.hash(req.password)
        user = User(
            email=str(req.email),
            name=req.name,
            password_hash=password_hash,
            plan="free",
            is_active=True,
        )
        db.add(user)
        await db.flush()

        onboarding = OnboardingProgress(
            user_id=user.id,
            current_step=1,
            is_completed=False,
            data={},
        )
        db.add(onboarding)

        settings = get_settings()
        access = create_access_token(str(user.id))
        raw_refresh, refresh_hash = create_refresh_token()
        expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)

        sess = AuthSessionRow(
            user_id=user.id,
            refresh_token_hash=refresh_hash,
            expires_at=expires_at,
            is_revoked=False,
        )
        db.add(sess)

        await db.commit()
        await db.refresh(user)
        return user, access, raw_refresh

    async def login(self, db: AsyncSession, req: LoginRequest) -> tuple[User, str, str]:
        result = await db.execute(select(User).where(User.email == str(req.email)))
        user = result.scalar_one_or_none()
        if user is None or user.password_hash is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas",
            )

        try:
            ph.verify(user.password_hash, req.password)
        except VerifyMismatchError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas",
            ) from None

        settings = get_settings()
        access = create_access_token(str(user.id))
        raw_refresh, refresh_hash = create_refresh_token()
        expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)

        sess = AuthSessionRow(
            user_id=user.id,
            refresh_token_hash=refresh_hash,
            expires_at=expires_at,
            is_revoked=False,
        )
        db.add(sess)
        await db.commit()
        await db.refresh(user)
        return user, access, raw_refresh

    async def refresh(self, db: AsyncSession, req: RefreshRequest) -> tuple[str, str]:
        hashed = hashlib.sha256(req.refresh_token.encode()).hexdigest()
        now = datetime.now(UTC)

        result = await db.execute(
            select(AuthSessionRow).where(
                AuthSessionRow.refresh_token_hash == hashed,
                AuthSessionRow.is_revoked.is_(False),
                AuthSessionRow.expires_at > now,
            )
        )
        row = result.scalar_one_or_none()
        if row is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token inválido ou expirado",
            )

        user = await db.get(User, row.user_id)
        if user is None or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado",
            )

        row.is_revoked = True

        settings = get_settings()
        new_access = create_access_token(str(user.id))
        raw_refresh, refresh_hash = create_refresh_token()
        expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)

        new_sess = AuthSessionRow(
            user_id=user.id,
            refresh_token_hash=refresh_hash,
            expires_at=expires_at,
            is_revoked=False,
        )
        db.add(new_sess)
        await db.commit()

        return new_access, raw_refresh
