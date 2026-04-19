"""Declarative base do SQLAlchemy + mixins comuns."""

from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column


class Base(DeclarativeBase):
    """Base para todos os models. Alembic detecta via `Base.metadata`."""

    @declared_attr.directive
    def __tablename__(cls) -> str:
        # UserAccount -> user_account
        import re

        name = re.sub(r"(?<!^)(?=[A-Z])", "_", cls.__name__).lower()
        return name


class TimestampMixin:
    """Mixin para `created_at`/`updated_at` com default e onupdate."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )


class UUIDPkMixin:
    """Mixin para PK UUID v4."""

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )
