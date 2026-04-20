"""Testes da classe base NoxAgent."""

import uuid
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.agents.base import AgentResult, NoxAgent
from app.models.agent_insight import AgentInsight

# ── Agente concreto mínimo para testes ────────────────────────────────────


class DummyAgent(NoxAgent):
    name = "Teste"
    agent_type = "dummy"
    model = "gpt-4o-mini"
    monthly_token_budget = 1_000

    async def should_run(self, user_id: uuid.UUID, db: Any) -> bool:
        return True

    async def _build_messages(self, user_id: uuid.UUID, db: Any) -> list[Any]:
        return [{"role": "user", "content": "ping"}]

    def _parse_response(self, raw: str) -> AgentResult:
        return AgentResult(content=raw or "fallback insight")


# ── Fixtures ──────────────────────────────────────────────────────────────


@pytest.fixture
def agent() -> DummyAgent:
    return DummyAgent()


@pytest.fixture
def mock_db() -> AsyncMock:
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    return db


@pytest.fixture
def user_id() -> uuid.UUID:
    return uuid.uuid4()


# ── Testes ────────────────────────────────────────────────────────────────


class TestAgentResult:
    def test_defaults(self) -> None:
        r = AgentResult(content="insight")
        assert r.tokens_used == 0
        assert r.metadata == {}


class TestNoxAgentBase:
    @pytest.mark.asyncio
    async def test_run_returns_insight_when_ok(
        self, agent: DummyAgent, mock_db: AsyncMock, user_id: uuid.UUID
    ) -> None:
        """run() deve persistir e retornar AgentInsight quando tudo corre bem."""
        with (
            patch.object(agent, "has_budget", return_value=True),
            patch.object(agent, "_chat", return_value=("Insight de teste", 42)),
            patch.object(agent, "_save_insight", new_callable=AsyncMock) as mock_save,
        ):
            fake_insight = MagicMock(spec=AgentInsight)
            mock_save.return_value = fake_insight

            result = await agent.run(user_id=user_id, db=mock_db)

        assert result is fake_insight
        mock_save.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_run_returns_none_when_no_budget(
        self, agent: DummyAgent, mock_db: AsyncMock, user_id: uuid.UUID
    ) -> None:
        with patch.object(agent, "has_budget", return_value=False):
            result = await agent.run(user_id=user_id, db=mock_db)
        assert result is None

    @pytest.mark.asyncio
    async def test_run_returns_none_when_should_not_run(
        self, agent: DummyAgent, mock_db: AsyncMock, user_id: uuid.UUID
    ) -> None:
        with (
            patch.object(agent, "has_budget", return_value=True),
            patch.object(agent, "should_run", return_value=False),
        ):
            result = await agent.run(user_id=user_id, db=mock_db)
        assert result is None

    @pytest.mark.asyncio
    async def test_chat_returns_empty_fallback_when_key_missing(
        self, agent: DummyAgent, mock_db: AsyncMock
    ) -> None:
        """_chat() não deve levantar exceção se OPENAI_API_KEY ausente."""
        with patch("app.agents.base.settings") as mock_settings:
            mock_settings.openai_api_key = None
            content, tokens = await agent._chat([{"role": "user", "content": "oi"}])
        assert content == ""
        assert tokens == 0

    @pytest.mark.asyncio
    async def test_chat_returns_empty_fallback_on_openai_error(self, agent: DummyAgent) -> None:
        """_chat() deve engolir exceções da OpenAI e retornar fallback."""
        with patch("app.agents.base.AsyncOpenAI") as mock_cls:
            mock_client = MagicMock()
            mock_client.chat.completions.create = AsyncMock(side_effect=Exception("timeout"))
            mock_cls.return_value = mock_client
            with patch("app.agents.base.settings") as mock_settings:
                mock_settings.openai_api_key = "fake-key"
                mock_settings.openai_model_mini = "gpt-4o-mini"
                content, tokens = await agent._chat([{"role": "user", "content": "oi"}])
        assert content == ""
        assert tokens == 0

    @pytest.mark.asyncio
    async def test_has_budget_true_when_under_limit(
        self, agent: DummyAgent, mock_db: AsyncMock, user_id: uuid.UUID
    ) -> None:
        with patch.object(agent, "_get_monthly_tokens_used", return_value=500):
            result = await agent.has_budget(user_id=user_id, db=mock_db)
        assert result is True

    @pytest.mark.asyncio
    async def test_has_budget_false_when_over_limit(
        self, agent: DummyAgent, mock_db: AsyncMock, user_id: uuid.UUID
    ) -> None:
        with patch.object(agent, "_get_monthly_tokens_used", return_value=1_001):
            result = await agent.has_budget(user_id=user_id, db=mock_db)
        assert result is False
