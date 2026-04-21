"""Testes dos agentes concretos (Sentinela, Oráculo, Norte)."""

from __future__ import annotations

import json
import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.agents.norte import Norte
from app.agents.oraculo import Oraculo
from app.agents.sentinela import Sentinela


@pytest.fixture
def user_id() -> uuid.UUID:
    return uuid.uuid4()


@pytest.fixture
def mock_db() -> AsyncMock:
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    return db


def _mock_execute_empty(db: AsyncMock) -> None:
    """Configura db.execute para retornar resultado vazio."""
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_result.scalars.return_value.all.return_value = []
    mock_result.scalar.return_value = 0
    db.execute = AsyncMock(return_value=mock_result)


# ── Sentinela ─────────────────────────────────────────────────────────────


class TestSentinela:
    def setup_method(self) -> None:
        self.agent = Sentinela()

    @pytest.mark.asyncio
    async def test_should_run_false_when_no_recent_transactions(
        self, user_id: uuid.UUID, mock_db: AsyncMock
    ) -> None:
        _mock_execute_empty(mock_db)
        result = await self.agent.should_run(user_id=user_id, db=mock_db)
        assert result is False

    @pytest.mark.asyncio
    async def test_should_run_true_when_recent_transactions_exist(
        self, user_id: uuid.UUID, mock_db: AsyncMock
    ) -> None:
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = uuid.uuid4()
        mock_db.execute = AsyncMock(return_value=mock_result)
        result = await self.agent.should_run(user_id=user_id, db=mock_db)
        assert result is True

    def test_parse_response_valid_json(self) -> None:
        payload = json.dumps(
            {
                "anomalias": [
                    {
                        "tipo": "duplicata",
                        "descricao": "Dois débitos Netflix",
                        "valor": "R$ 39,90",
                        "acao": "Verificar",
                    }
                ],
                "resumo": "Notei que há um débito duplicado do Netflix.",
                "tem_alertas": True,
            }
        )
        result = self.agent._parse_response(payload)
        assert "Netflix" in result.content
        assert result.metadata.get("tem_alertas") is True

    def test_parse_response_empty_returns_fallback(self) -> None:
        result = self.agent._parse_response("")
        assert result.content != ""
        assert result.metadata.get("tem_alertas") is False

    def test_parse_response_invalid_json_returns_fallback(self) -> None:
        result = self.agent._parse_response("não é json")
        assert result.content != ""


# ── Oráculo ───────────────────────────────────────────────────────────────


class TestOraculo:
    def setup_method(self) -> None:
        self.agent = Oraculo()

    @pytest.mark.asyncio
    async def test_should_run_true_when_no_recent_insight(
        self, user_id: uuid.UUID, mock_db: AsyncMock
    ) -> None:
        _mock_execute_empty(mock_db)
        result = await self.agent.should_run(user_id=user_id, db=mock_db)
        assert result is True

    @pytest.mark.asyncio
    async def test_should_run_false_when_ran_recently(
        self, user_id: uuid.UUID, mock_db: AsyncMock
    ) -> None:
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = uuid.uuid4()
        mock_db.execute = AsyncMock(return_value=mock_result)
        result = await self.agent.should_run(user_id=user_id, db=mock_db)
        assert result is False

    def test_parse_response_valid_json(self) -> None:
        payload = json.dumps(
            {
                "insight_principal": "A tendência esse mês é de gastos 15% acima do normal.",
                "total_semana_atual": "R$ 1.200,00",
                "recomendacao": "Reduza gastos com delivery.",
            }
        )
        result = self.agent._parse_response(payload)
        assert "tendência" in result.content

    def test_parse_response_empty_returns_fallback(self) -> None:
        result = self.agent._parse_response("")
        assert result.content != ""


# ── Norte ─────────────────────────────────────────────────────────────────


class TestNorte:
    def setup_method(self) -> None:
        self.agent = Norte()

    @pytest.mark.asyncio
    async def test_should_run_true_when_no_insight_today(
        self, user_id: uuid.UUID, mock_db: AsyncMock
    ) -> None:
        _mock_execute_empty(mock_db)
        result = await self.agent.should_run(user_id=user_id, db=mock_db)
        assert result is True

    def test_parse_response_valid_json(self) -> None:
        payload = json.dumps(
            {
                "mensagem_do_dia": "Faltam R$ 300,00 para atingir seu ritmo ideal.",
                "saude_financeira": "boa",
                "percentual_do_mes_gasto": 45,
                "dica": "Evite gastos com delivery esta semana.",
            }
        )
        result = self.agent._parse_response(payload)
        assert "Faltam" in result.content
        assert result.metadata.get("saude_financeira") == "boa"

    def test_parse_response_empty_returns_fallback(self) -> None:
        result = self.agent._parse_response("")
        assert result.content != ""
