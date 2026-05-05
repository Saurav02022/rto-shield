def status_from_ping(ok: bool) -> str:
    """Map datastore ping outcome to external status."""
    return "ok" if ok else "degraded"
