import logging
import sys

from app.core.settings import settings


def configure_logging() -> None:
    """Configure root logging once at application startup."""
    level = logging.DEBUG if settings.ENV == "development" else logging.INFO
    logging.basicConfig(
        level=level,
        stream=sys.stdout,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        force=True,
    )
