"""Testes do Companheiro e endpoints /agents."""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

from app.agents.companheiro import Companheiro

# ── Unit tests: Companheiro ────────────────────────────────────────────────


class TestCompanheiro:
    def setup_method(self) -> None:
        self.agent = Companheiro()

    def test_parse_response_returns_content(self) -> None:
        result = self.agent._parse_response("Olá! Como posso ajudar?")
        assert result.content == "Olá! Como posso ajudar?"

    def test_parse_response_empty_returns_fallback(self) -> None:
        result = self.agent._parse_response("")
        assert result.content != ""

    @pytest.mark.asyncio
    async def test_should_run_always_true(self) -> None:
        db = AsyncMock()
        result = await self.agent.should_run(user_id=uuid.uuid4(), db=db)
        assert result is True

    @pytest.mark.asyncio
    async def test_stream_chat_yields_fallback_when_no_api_key(self) -> None:
        """Sem OPENAI_API_KEY, stream retorna mensagem de fallback."""
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        db.execute = AsyncMock(return_value=mock_result)

        with patch("app.agents.companheiro.settings") as mock_settings:
            mock_settings.openai_api_key = None

            chunks: list[str] = []
            async for chunk in self.agent.stream_chat(message="Oi", user_id=uuid.uuid4(), db=db):
                chunks.append(chunk)

        assert len(chunks) > 0
        assert any("indisponível" in c.lower() or c != "" for c in chunks)

    @pytest.mark.asyncio
    async def test_stream_chat_yields_fallback_on_openai_error(self) -> None:
        """Erro na OpenAI retorna mensagem amigável, não levanta exceção."""
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        db.execute = AsyncMock(return_value=mock_result)

        with patch("app.agents.companheiro.AsyncOpenAI") as mock_cls:
            mock_client = MagicMock()
            mock_client.chat.completions.create = AsyncMock(
                side_effect=Exception("connection error")
            )
            mock_cls.return_value = mock_client
            with patch("app.agents.companheiro.settings") as mock_settings:
                mock_settings.openai_api_key = "fake-key"
                mock_settings.openai_model_full = "gpt-4o"

                chunks: list[str] = []
                async for chunk in self.agent.stream_chat(
                    message="Oi", user_id=uuid.uuid4(), db=db
                ):
                    chunks.append(chunk)

        assert len(chunks) > 0
        full = "".join(chunks)
        assert "problema" in full.lower() or "tente" in full.lower()


# ── Integration tests: /agents endpoints ─────────────────────────────────


@pytest.mark.asyncio
async def test_list_insights_empty(auth_client: AsyncClient) -> None:
    """GET /agents/insights retorna lista vazia quando não há insights."""
    response = await auth_client.get("/agents/insights")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_list_insights_by_invalid_agent_type(auth_client: AsyncClient) -> None:
    """Agent type inválido retorna 422."""
    response = await auth_client.get("/agents/insights/nao_existe")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_insights_by_valid_agent_type(auth_client: AsyncClient) -> None:
    """Agent types válidos retornam 200 com lista (possivelmente vazia)."""
    for agent_type in ("sentinela", "oraculo", "norte", "companheiro"):
        response = await auth_client.get(f"/agents/insights/{agent_type}")
        assert response.status_code == 200, f"Falhou para {agent_type}"
        assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_mark_insight_read_not_found(auth_client: AsyncClient) -> None:
    """PATCH em insight inexistente retorna 404."""
    fake_id = uuid.uuid4()
    response = await auth_client.patch(f"/agents/insights/{fake_id}/read")
    assert response.status_code == 404
