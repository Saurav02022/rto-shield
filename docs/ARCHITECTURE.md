# Architecture

Deep reference for RTO Shield. Split into **HLD** (what exists in the system and how the major pieces talk) and **LLD** (how each codebase is structured internally). For the short version, see the [root README](../README.md).

## Contents

1. [HLD: System context](#hld-system-context)
2. [HLD: Deployment and delivery](#hld-deployment-and-delivery)
3. [HLD: Data and control flows](#hld-data-and-control-flows)
4. [LLD: Backend (FastAPI)](#lld-backend-fastapi)
5. [LLD: Frontend (Next.js App Router)](#lld-frontend-nextjs-app-router)
6. [Design decisions](#design-decisions)
7. [API surface](#api-surface)
8. [Reliability and caveats](#reliability-and-caveats)

---

## HLD: System context

Logical view: **who** touches **which runtime**, and **where data + secrets** live.

```mermaid
flowchart TB
  subgraph human [People]
    OP[Operator]
  end
  subgraph voice [Bolna]
    BOL[Bolna voice platform]
  end
  subgraph gcp [Google Cloud]
    FE[Cloud Run service - Next.js]
    BE[Cloud Run service - FastAPI]
    FS[(Firestore)]
    SM[(Secret Manager)]
    AR[(Artifact Registry)]
  end
  subgraph gh [GitHub]
    GA[Actions CI_CD]
  end

  OP -->|HTTPS UI| FE
  FE -->|server-side HTTPS| BE
  BE -->|HTTPS place_call executions| BOL
  BOL -->|async POST webhook| BE
  BE --> FS
  BE -.->|read keys at runtime| SM
  GA -->|OIDC_WIF publish image| AR
  GA -->|deploy revision| FE
  GA -->|deploy revision| BE
```

**Reading the diagram:**

- **Synchronous path:** Operator → Next (SSR/RSC + BFF routes) → FastAPI → (optional Bolna outbound when the operator clicks Verify).
- **Asynchronous path:** Bolna terminates the call → `POST /webhooks/bolna` → FastAPI updates `Store`; the UI may Refresh to poll executions if the webhook payload was thin.
- **State:** authoritative order + call snapshots in Firestore (cloud) or memory (local/tests).
- **Secrets:** Bolna keys (and the demo phone number) come from Secret Manager at runtime — never from the repo.
- **Supply chain:** images land in Artifact Registry; GitHub deploys both services with WIF (no long-lived GCP JSON keys in GitHub).

---

## HLD: Deployment and delivery

How the **repository** maps to **runtimes** and **pipelines**.

```mermaid
flowchart LR
  subgraph repo [Monorepo]
    BEsrc[backend/]
    FEsrc[frontend/]
    WF[.github/workflows]
  end
  subgraph ci [CI every push_PR]
    T1[pytest]
    T2[typecheck_lint_vitest]
  end
  subgraph cd [CD manual dispatch]
    D1[deploy-backend.yml]
    D2[deploy-frontend.yml]
  end
  subgraph reg [asia-south1 Artifact Registry]
    IMG1[backend image]
    IMG2[frontend image]
  end

  BEsrc & FEsrc --> T1 & T2
  BEsrc --> D1 --> IMG1
  FEsrc --> D2 --> IMG2
  WF --> ci & cd
  IMG1 --> BEcr[Cloud Run backend]
  IMG2 --> FEcr[Cloud Run frontend]
```

Each deploy workflow: **`docker build` → container smoke on the runner → push digest → `gcloud run deploy`**. Plaintext tuning comes from GitHub Variables; sensitive values from Secret Manager. Details in [`DEPLOYMENT.md`](DEPLOYMENT.md).

---

## HLD: Data and control flows

```mermaid
sequenceDiagram
  participant U as Operator
  participant N as Next.js BFF_RSC
  participant B as FastAPI
  participant L as Bolna API
  participant W as Bolna webhook
  participant D as Store Firestore

  U->>N: Dashboard verify refresh
  N->>B: REST orders verify refresh
  B->>L: HTTPS place_call GET execution
  B->>D: Upsert orders calls
  L-->>W: post-call webhook
  W->>B: POST webhooks bolna
  B->>D: Normalize idempotent persist
```

---

## LLD: Backend (FastAPI)

**Layer model** enforced in-code: **`router` → `service` → `repository` → `Store`**. Cross-cutting **`mutator`** modules normalize external shapes (Bolna webhook / executions) before persistence. **`deps.py`** is the composition root for FastAPI DI.

```mermaid
flowchart TB
  subgraph expose [Transport]
    M[main.py + CORS + lifespan]
    R_O[domains/orders/router]
    R_C[domains/calls/router actions]
    R_W[domains/calls/router webhooks bolna]
    R_H[domains/health/router]
  end
  subgraph svc [Application services]
    S_O[OrderService]
    S_C[CallService]
    S_H[HealthService]
  end
  subgraph dom [Domains]
    Repo_O[OrderRepository]
    Repo_C[CallRepository]
    Mut_O[orders/mutator]
    Mut_C[calls/mutator]
  end
  subgraph ports [Ports]
    ST[(Store protocol)]
    BC[BolnaClient shared]
  end

  M --> R_O & R_C & R_W & R_H
  R_O --> S_O --> Repo_O
  R_C & R_W --> S_C --> Repo_C & BC
  Repo_O & Repo_C --> ST
  S_C -.-> Mut_C
  S_O -.-> Mut_O
  R_H --> S_H
```

**Module map (physical):**

| Path | Responsibility |
|------|----------------|
| `app/core/` | `settings`, **`db.Store` + InMemory + Firestore**, `deps`, lifespan wiring |
| `app/domains/orders/` | Orders CRUD, list, **`router`**, **`service`**, **`repository`**, **`mutator`**, Pydantic **`schemas`** |
| `app/domains/calls/` | Verify + refresh flow, webhook ingest, **`CallRepository`** idempotency, **`BolnaWebhookPayload`** |
| `app/shared/bolna_client.py` | `place_call`, `get_execution` over HTTPS |
| `app/domains/health/` | Liveness/readiness-style surface for ops |

Conventions: [`backend/AGENTS.md`](../backend/AGENTS.md).

---

## LLD: Frontend (Next.js App Router)

**Two data planes:** (1) **Server Components + `orders-server`** for first paint / SEO-safe data loading. (2) **Client Components + TanStack Query** calling **`/api/*` route handlers**, so the browser never needs the FastAPI URL or secrets.

```mermaid
flowchart TB
  subgraph rsc [Server layer]
    Pg[app/page.tsx RSC]
    Pd[app/orders/id RSC]
    OSV[lib/orders-server.ts]
    BF[lib/backendFetch]
  end
  subgraph bff [BFF Route Handlers]
    R0["/api/orders"]
    R1["/api/orders/[id]"]
    Rv["/api/.../verify"]
    Rr["/api/.../refresh"]
    Rh["/api/health"]
  end
  subgraph ui [Client layer]
    Ctr[OrdersContainer hooks]
    H[useOrdersQuery useOrderMutations]
    Cmp[components/orders Row List Dialog]
  end

  Pg & Pd --> OSV --> BF
  Ctr --> Cmp
  Ctr --> H
  H -->|same-origin fetch| R0 & R1 & Rv & Rr
  R0 & R1 & Rv & Rr --> BF
  BF -->|BACKEND_API_URL| API[FastAPI]
```

**Module map (`frontend/src/`):**

| Area | Responsibility |
|------|----------------|
| `app/` | RSC pages, **`api/**/route.ts`** BFF proxies, layout, loading, `api/health` for container smoke |
| `lib/` | `backendFetch`, `orders-server`, `api-response` helpers |
| `hooks/` | React Query wrappers + mutations + cache invalidation |
| `components/orders/` | Presentational dashboard + dialogs |
| `config/`, `constants/`, `types/`, `query-keys/` | Env, routes, enums, typed API models, query factories |
| `providers/` | `QueryClientProvider`, `Toaster` |

Conventions: [`frontend/AGENTS.md`](../frontend/AGENTS.md).

---

## Design decisions

| Topic | Approach |
|-------|----------|
| **Browser → APIs** | **BFF `/api/*`** keeps FastAPI origins and secrets off the public client surface. |
| **Persistence** | Domains speak **`Store`** only — swap **memory** vs **Firestore** without rewriting repositories. |
| **Voice unreliability** | **Webhook idempotency** + **`refresh` → executions API** share one normalisation pipeline. |

---

## API surface

Full detail in OpenAPI **`/docs`** when the backend is running.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Liveness / CI smoke |
| `GET` | `/orders` | Paginated list (shape in orders router) |
| `POST` | `/orders` | Create order (demo / ops) |
| `PATCH` | `/orders/{id}` | Update customer / product fields (Bolna-derived fields untouched) |
| `DELETE` | `/orders/{id}` | Remove order + linked call docs |
| `GET` | `/orders/{id}` | Order + last call snapshot |
| `POST` | `/orders/{id}/verify` | Trigger Bolna outbound call |
| `POST` | `/orders/{id}/refresh` | Pull latest Bolna execution + reconcile |
| `GET` | `/orders/{id}/calls` | Call history for order |
| `POST` | `/webhooks/bolna` | Bolna post-call webhook |

The frontend mirrors mutations through **`/api/orders/...`** Next route handlers (BFF). Webhook implementation: [`backend/app/domains/calls/router.py`](../backend/app/domains/calls/router.py).

---

## Reliability and caveats

1. **Webhooks:** deliveries can repeat; the handler is **idempotent** and only "locks" processing when a **meaningful signal** exists (avoids starving late-arriving extractions).
2. **Execution lag:** Bolna `extracted_data` may land after `call-disconnected`; **`refresh`** is the supported reconciliation path.
3. **Transcript mining:** if structured extraction is empty but the assistant spoke tagged outcomes, the backend applies a **narrow regex fallback** — demo resilience, not a replacement for fixing extraction upstream.
4. **Firestore:** first complex list queries may require **composite indexes** (the console suggests the exact YAML).
5. **CORS + credentials:** list every real HTTPS origin explicitly — `*` is illegal while `allow_credentials=True` on FastAPI.
