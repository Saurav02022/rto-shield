from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import get_health_service
from app.domains.health.schemas import HealthResponse
from app.domains.health.service import HealthService

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health(
    svc: Annotated[HealthService, Depends(get_health_service)],
) -> HealthResponse:
    return await svc.get_health()
