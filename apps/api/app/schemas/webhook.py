"""Schemas Pydantic para webhooks externos."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class PluggyWebhookPayload(BaseModel):
    model_config = ConfigDict(extra="allow")

    event: str  # "item/updated" | "item/error" | "item/created" etc.
    itemId: str
    error: str | None = None
