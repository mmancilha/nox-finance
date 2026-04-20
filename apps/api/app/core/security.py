"""Criptografia e utilidades de segurança.

Tokens bancários (Pluggy) SEMPRE passam por `encrypt_token` antes de ir ao banco.
Regra inegociável do .cursorrules.

JWT (HS256) para sessões de API, ver `create_access_token` / `decode_access_token`.
"""

from __future__ import annotations

import base64
import binascii
import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.core.config import get_settings

NONCE_SIZE = 12  # AES-GCM recomendado


def _load_key() -> bytes:
    """Carrega a ENCRYPTION_KEY e valida tamanho (32 bytes decodificados)."""
    raw = get_settings().encryption_key
    # Aceita base64 ou string crua de 32 bytes
    try:
        key = base64.b64decode(raw, validate=True)
    except (ValueError, binascii.Error):
        key = raw.encode("utf-8")

    if len(key) != 32:
        # Em dev, derivamos uma chave determinística de 32 bytes. Em prod,
        # o .env deve conter uma chave AES-256 real em base64.
        from hashlib import sha256

        key = sha256(raw.encode("utf-8")).digest()
    return key


def encrypt_token(plaintext: str) -> str:
    """Encripta um token sensível (ex.: Pluggy access token) com AES-256-GCM.

    Retorno: string em base64 no formato `nonce || ciphertext || tag`.
    """
    aes = AESGCM(_load_key())
    nonce = secrets.token_bytes(NONCE_SIZE)
    ct = aes.encrypt(nonce, plaintext.encode("utf-8"), associated_data=None)
    return base64.b64encode(nonce + ct).decode("utf-8")


def decrypt_token(encoded: str) -> str:
    """Decripta um token encriptado por `encrypt_token`."""
    data = base64.b64decode(encoded.encode("utf-8"))
    nonce, ct = data[:NONCE_SIZE], data[NONCE_SIZE:]
    aes = AESGCM(_load_key())
    return aes.decrypt(nonce, ct, associated_data=None).decode("utf-8")


def create_access_token(user_id: str) -> str:
    """JWT de curta duração (access)."""
    settings = get_settings()
    now = datetime.now(UTC)
    expire = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": user_id,
        "type": "access",
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token() -> tuple[str, str]:
    """Gera (token_raw, sha256_hex). Persistir apenas o hash."""
    raw = secrets.token_urlsafe(48)
    hashed = hashlib.sha256(raw.encode()).hexdigest()
    return raw, hashed


def decode_access_token(token: str) -> dict[str, Any]:
    """Decodifica access JWT. Levanta jwt.ExpiredSignatureError ou jwt.InvalidTokenError."""
    settings = get_settings()
    return jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
    )
