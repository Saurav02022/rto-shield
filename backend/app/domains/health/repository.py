"""Data access for health checks (DB driver, caches, external probes)."""

from app.core.db import Database


class HealthRepository:
    def __init__(self, db: Database) -> None:
        self._db = db

    async def ping(self) -> bool:
        _ = self._db.connected
        return True
