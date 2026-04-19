"""Heartbeats Celery — placeholders do Sprint 1.

No Sprint 4 estas tasks vão invocar os agentes reais (Oráculo, Norte).
Por enquanto só servem para confirmar que Beat + worker estão conversando.
"""

from app.core.celery_app import celery_app
from app.core.logging import get_logger

log = get_logger(__name__)


@celery_app.task(name="app.tasks.heartbeat.heartbeat_oraculo_weekly")
def heartbeat_oraculo_weekly() -> dict[str, str]:
    """Placeholder que roda domingo 20h. No Sprint 4 invoca o Oráculo real."""
    log.info("heartbeat.oraculo", status="stub_sprint_1")
    return {"agent": "oraculo", "status": "stub_sprint_1"}


@celery_app.task(name="app.tasks.heartbeat.heartbeat_norte_daily")
def heartbeat_norte_daily() -> dict[str, str]:
    """Placeholder que roda diariamente 8h. No Sprint 4 invoca o Norte real."""
    log.info("heartbeat.norte", status="stub_sprint_1")
    return {"agent": "norte", "status": "stub_sprint_1"}


@celery_app.task(name="app.tasks.heartbeat.ping")
def ping() -> str:
    """Task on-demand para testar o worker. `celery call app.tasks.heartbeat.ping`."""
    log.info("heartbeat.ping")
    return "pong"
