from app.domains.health.mutator import status_from_ping
from app.domains.health.repository import HealthRepository
from app.domains.health.schemas import HealthResponse


class HealthService:
    def __init__(self, repo: HealthRepository):
        self._repo = repo

    async def get_health(self) -> HealthResponse:
        ok = await self._repo.ping()
        return HealthResponse(status=status_from_ping(ok))
