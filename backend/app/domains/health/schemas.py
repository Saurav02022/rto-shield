from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """API contract for `GET /health`."""

    status: str = Field(examples=["ok"])
