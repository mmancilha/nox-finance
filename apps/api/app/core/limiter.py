"""Rate limiter compartilhado (slowapi).

Não definimos `default_limits` para deixar o controle por rota,
aplicado via `@limiter.limit(...)` nos endpoints sensíveis.
Em produção, trocar o storage para Redis (ver docs do slowapi).
"""

from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[],
    headers_enabled=True,
)
