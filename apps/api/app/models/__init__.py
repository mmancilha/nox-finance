"""Modelos SQLAlchemy. Importar aqui para metadata do Alembic."""

from app.models.agent_insight import AgentInsight
from app.models.bank_account import BankAccount
from app.models.base import Base
from app.models.category import Category
from app.models.onboarding import OnboardingProgress
from app.models.session import Session
from app.models.transaction import Transaction
from app.models.user import User

__all__ = [
    "AgentInsight",
    "BankAccount",
    "Base",
    "Category",
    "OnboardingProgress",
    "Session",
    "Transaction",
    "User",
]
