"""Celery app do Nox.

Tarefas pesadas (sync bancário, IA, emails) SEMPRE passam por aqui.
Nunca chamar Pluggy/OpenAI direto no request do usuário (.cursorrules).
"""

from importlib import import_module

from celery import Celery
from celery.schedules import crontab

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "nox",
    broker=settings.broker_url,
    backend=settings.result_backend,
    include=[
        "app.tasks.heartbeat",
        "app.tasks.sync_transactions",
    ],
)

celery_app.conf.update(
    # Timezone Brasil, agendamentos batem com o briefing
    timezone="America/Sao_Paulo",
    enable_utc=False,
    # Segurança / resiliência
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_time_limit=60 * 10,  # 10 min hard
    task_soft_time_limit=60 * 9,
    worker_prefetch_multiplier=1,
    # Serialização
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    # Resultado
    result_expires=60 * 60 * 24,  # 1 dia
)

# ── Beat schedule ────────────────────────────────────────
# Sprint 4: substituir as tasks dummy pelos heartbeats reais dos agentes.
celery_app.conf.beat_schedule = {
    "oraculo-weekly-sunday-20h": {
        "task": "app.tasks.heartbeat.heartbeat_oraculo_weekly",
        "schedule": crontab(hour=20, minute=0, day_of_week=0),
    },
    "norte-daily-8h": {
        "task": "app.tasks.heartbeat.heartbeat_norte_daily",
        "schedule": crontab(hour=8, minute=0),
    },
}

# Carrega módulos de tasks na importação (pytest e smoke sem worker precisam dos nomes registrados).
import_module("app.tasks.heartbeat")
import_module("app.tasks.sync_transactions")
