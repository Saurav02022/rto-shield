from typing import Annotated

from fastapi import Depends, Request

from app.core.db import Database
from app.domains.health.repository import HealthRepository
from app.domains.health.service import HealthService


def get_db(request: Request) -> Database:
    db = getattr(request.app.state, "db", None)
    if db is None:
        raise RuntimeError("Database not initialised on app state — check lifespan.")
    return db


def get_health_repository(
    db: Annotated[Database, Depends(get_db)],
) -> HealthRepository:
    return HealthRepository(db=db)


def get_health_service(
    repo: Annotated[HealthRepository, Depends(get_health_repository)],
) -> HealthService:
    return HealthService(repo=repo)
