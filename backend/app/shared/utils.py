"""Small pure helpers only — domain logic belongs under `domains/`."""


def truthy(env_value: str | None) -> bool:
    return env_value is not None and env_value.strip().lower() in {"1", "true", "yes", "on"}
