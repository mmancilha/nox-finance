"""Smoke tests do Sprint 1, garantem que a app sobe e os módulos são importáveis."""

from fastapi.testclient import TestClient

from app import __version__
from app.core.security import decrypt_token, encrypt_token
from app.main import app


def test_root_endpoint() -> None:
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    body = response.json()
    assert body["app"] == "Nox API"
    assert body["version"] == __version__
    # Mensagem em pt-BR é regra (.cursorrules)
    assert "você" in body["mensagem"].lower()


def test_encrypt_decrypt_roundtrip() -> None:
    """AES-256-GCM, tokens bancários voltam iguais após round-trip."""
    original = "pluggy-access-token-xyz-12345"
    encrypted = encrypt_token(original)
    assert encrypted != original
    assert decrypt_token(encrypted) == original


def test_celery_app_importable() -> None:
    """Garante que o Celery app registra as tasks do heartbeat."""
    from app.core.celery_app import celery_app

    assert "app.tasks.heartbeat.ping" in celery_app.tasks
    assert "app.tasks.heartbeat.heartbeat_oraculo_weekly" in celery_app.tasks
    assert "app.tasks.heartbeat.heartbeat_norte_daily" in celery_app.tasks
