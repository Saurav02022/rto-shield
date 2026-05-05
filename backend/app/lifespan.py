from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.db import database_lifespan
from app.core.logging import configure_logging
from app.core.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    configure_logging()
    async with database_lifespan() as db:
        app.state.db = db
        yield
