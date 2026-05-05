# Backend — Agent Instructions (FastAPI)

This document is the single source of truth for how the FastAPI backend is structured, how layers interact, and the rules every change must follow.

---

## Stack

- **Language:** Python 3.12+
- **Framework:** FastAPI
- **Server:** Uvicorn (dev) / Gunicorn + Uvicorn workers (prod)
- **Validation:** Pydantic v2
- **Settings:** pydantic-settings
- **Tests:** Pytest + pytest-asyncio + Starlette `TestClient` (lifespan-aware) / `httpx.AsyncClient` when lifespan is wired explicitly
- **Container:** Docker (production image uses only requirements.txt)

---

## Quick Start (Local Development)

```bash
cd backend

python3 -m venv venv
venv/bin/python -m pip install -r requirements.txt
venv/bin/python -m pip install -r requirements-dev.txt

cp .env.example .env

./start.sh
# OR
venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

Server: [http://localhost:8000](http://localhost:8000)

* `/docs` → Swagger UI
* `/redoc` → API docs
* `/health` → Health check

---

## Folder Structure (Target)

This tree is the **canonical layout** for this project. If the repository still has older paths (see Legacy below), do not add new code there.

```
backend/
│
├── app/
│   ├── main.py                   # App factory: routers, middleware, CORS, exception handlers, lifespan
│   ├── lifespan.py               # Optional: startup/shutdown hooks; import from main if used
│
│   ├── core/                     # Cross-cutting infrastructure ONLY
│   │   ├── auth.py
│   │   ├── db.py
│   │   ├── deps.py
│   │   ├── settings.py
│   │   ├── logging.py
│   │   ├── exceptions.py         # Domain/app exceptions + registration helpers for FastAPI handlers
│   │   └── route_paths.py
│
│   ├── domains/                  # PRIMARY layout — mandatory for all new features
│   │   └── <domain>/
│   │       ├── router.py
│   │       ├── service.py
│   │       ├── repository.py
│   │       ├── schemas.py
│   │       ├── models.py        # Optional — SQLAlchemy / ORM models only
│   │       └── mutator.py
│
│   ├── shared/                   # Reusable logic across domains — add sparingly, review in PR
│   │   ├── utils.py
│   │   ├── constants.py
│   │   └── validators.py
│
│   └── legacy/                   # Optional quarantine folder during migration ONLY
│       ├── routers/
│       ├── services/
│       ├── repositories/
│       ├── models/
│       └── mutators/
│
├── tests/
│   ├── conftest.py
│   └── domains/
│       └── <domain>/
│           └── test_<feature>.py
│
├── requirements.txt
├── requirements-dev.txt
├── pytest.ini
├── pyproject.toml                # Optional — tool config (ruff, mypy, etc.)
├── Dockerfile
├── start.sh
└── README.md
```

### Legacy (do not extend)

Some FastAPI projects keep older modules at **`app/routers/`**, **`app/services/`**, etc. (top-level under `app/`, not inside `legacy/`). **Same rule:** no new files and no new features there — only maintenance of existing code until moved into `app/domains/<domain>/`.

---

## Application Wiring (`main.py`)

* Create the FastAPI app, register **all** routers (including `include_router` from each domain).
* Configure **CORS**, **trusted hosts**, and other middleware here (or in dedicated modules imported by `main.py`).
* Register **global exception handlers** so domain errors from `core/exceptions.py` map to consistent HTTP responses — avoid ad-hoc `HTTPException` scattered in services.
* **Lifespan:** use `@asynccontextmanager` in `main.py` or delegate to `lifespan.py`; keep DB client init/dispose in one place.

---

## Architecture (Strict Flow)

```
Request
   ↓
Router (thin)
   ↓
Service (business logic)
   ↓
Repository (DB access)
   ↓
Database
```

Mutator = pure transformation (no I/O)

---

## Non-Negotiable Rules

### Router

* **Thin by default:** dependency injection + one service call + return a typed response. The **3–5 line** guideline refers to **business logic**, not to OpenAPI metadata, multiple `Depends`, or multipart/WebSocket boilerplate — those may add lines without violating the spirit of the rule.
* No business logic
* No DB access
* Calls exactly **one** service method per HTTP handler (orchestration belongs in the service)

### Service

* Owns all business logic
* Orchestrates repository + mutator
* No raw DB queries

### Repository

* Only DB access layer
* No business logic

### Mutator

* Pure function
* No DB / no network / no side effects (including no `datetime.now()` unless passed in or injected as a clock)

---

## Critical Rule (Important)

**All new features MUST be created inside `app/domains/`**

You are NOT allowed to:

* Add new files under legacy paths (`app/legacy/...`, or top-level `app/routers/`, `app/services/`, etc.)
* Mix new domain code with old layered folders in the same feature

Legacy code exists only until it is migrated into `app/domains/<domain>/`.

---

## Auth & Roles

* JWT-based auth via `core/auth.py`
* Use FastAPI **`Depends(...)`** for auth context and role guards

### Patterns

* Prefer **`APIRouter(..., dependencies=[Depends(require_active_user)])`** (or equivalent) so an entire sub-router is protected by default.
* Per-route overrides: `Depends(require_admin_context)` on individual endpoints when stricter access is needed.

### Example role guards (rename to match the project)

| Dependency | Purpose |
|------------|---------|
| `get_auth_context` | Any authenticated user — base context |
| `require_active_user` | Blocks pending / rejected accounts |
| `require_admin_context` | Admin-only routes |
| `require_teacher_or_admin` | Staff tools — blocks student role |

### Rules

* **Authorisation at the router boundary** (dependencies on routes or router). Do not re-implement role checks inside services except for defence-in-depth that mirrors the same rules.
* Never trust request body or query params for **user id** or **organisation id** — always take them from **`AuthContext`** (or equivalent) derived from the verified JWT.

---

## Database Migrations

If you use SQLAlchemy (or another ORM) with versioned schema:

* Keep migrations in the project’s standard location (e.g. **Alembic** `alembic/versions/` at the backend root or under `app/` — pick one and document it in `README.md`).
* Do not apply schema changes only in application code; agents must add a migration when the persisted model changes.

---

## Testing Rules

* Use `pytest`. For full-app HTTP tests, prefer Starlette **`TestClient`** so **lifespan runs** and `app.state` (e.g. database) is initialised. Use `httpx.AsyncClient` only when you explicitly run the ASGI lifespan alongside the client.
* Mock **only** the repository layer (or DB client boundary).
* Do **not** mock services or routers for behaviour tests — those layers are under test.
* Use FastAPI **`dependency_overrides`** for fake auth and fake DB clients.
* No real DB or third-party calls in automated tests unless explicitly marked integration (outside default CI).

---

## Environment Variables

Defined **only** in `app/core/settings.py` via a **`pydantic_settings.BaseSettings`** (or subclass) — not as raw `os.getenv` scattered across the codebase.

### Rules

* No `os.getenv()` outside `settings.py`
* Every new variable: add to the Settings class, type it, sync `.env.example`
* Import settings from a single module: `from app.core.settings import settings`

---

## Code Conventions

* `async` everywhere (except pure CPU helpers)
* Strong typing required
* No raw `dict` responses for public APIs — use Pydantic response models
* No `print()` → use logging from `core/logging`
* One service entrypoint per route handler
* Backward-compatible API changes only (additive schema changes preferred)

---

## Common Mistakes (Avoid These)

* Putting logic in router ❌
* Calling DB inside service directly ❌
* Ungoverned duplication in `shared/` ❌
* New code outside `app/domains/` ❌
* Skipping tests ❌

---

## When in Doubt

1. Start from router
2. Move logic to service
3. Move DB to repository
4. Move pure logic to mutator
5. Add tests

---

## Final Rule

If your change does not fit this structure, you **must justify it in the PR**.
