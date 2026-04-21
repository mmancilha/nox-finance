"""Agentes Nox — Sentinela, Oráculo, Norte, Companheiro."""

from app.agents.base import AgentResult, NoxAgent
from app.agents.norte import Norte
from app.agents.oraculo import Oraculo
from app.agents.sentinela import Sentinela

__all__ = [
    "AgentResult",
    "Norte",
    "NoxAgent",
    "Oraculo",
    "Sentinela",
]
