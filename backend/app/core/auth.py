"""JWT verification and role guards — extend when auth is required on routes."""

from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer(auto_error=False)


@dataclass(frozen=True, slots=True)
class AuthContext:
    """Identity derived from a verified Bearer token."""

    subject: str


async def require_auth_context(
    _credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> AuthContext:
    """Reject unauthenticated callers. Wire JWT decoding when JWT_SECRET is set."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="JWT authentication not implemented yet",
    )
