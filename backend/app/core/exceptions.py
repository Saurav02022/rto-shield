from typing import Any

from fastapi import FastAPI
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Application-level error mapped to HTTP responses."""

    def __init__(self, message: str, *, code: str = "APP_ERROR", status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_: Any, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": exc.code, "detail": exc.message},
        )
