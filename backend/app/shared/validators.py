"""Shared Pydantic / field validators (cross-domain reuse)."""


def non_empty_trimmed(value: str) -> str:
    s = value.strip()
    if not s:
        msg = "Value must not be empty"
        raise ValueError(msg)
    return s
