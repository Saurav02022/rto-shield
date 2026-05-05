"""Database client / pool — extend when SQLAlchemy or driver is added."""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from app.core.settings import settings

log = logging.getLogger(__name__)


class Database:
    """Placeholder resource; wire engine or pool in `connect` / `disconnect`."""

    def __init__(self) -> None:
        self._connected = False

    @property
    def connected(self) -> bool:
        return self._connected

    async def connect(self) -> None:
        if settings.DATABASE_URL:
            log.warning(
                "DATABASE_URL is set but no DB driver is configured yet "
                "(add SQLAlchemy/asyncpg here)."
            )
        self._connected = True

    async def disconnect(self) -> None:
        self._connected = False


@asynccontextmanager
async def database_lifespan() -> AsyncIterator[Database]:
    db = Database()
    await db.connect()
    try:
        yield db
    finally:
        await db.disconnect()
