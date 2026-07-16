# Deployment

CI/CD, GCP setup, and the full configuration reference for RTO Shield.

## Status

The original Cloud Run deployment is **offline**. The GCP project still exists and both revisions still report `Ready`, but its **trial billing account has closed**, leaving `billingEnabled: false`. With billing off, Cloud Run's data plane won't start containers — every request returns `503 The service you requested is not available yet` — and image pushes fail with `This API method requires billing to be enabled`.

Reviving it requires attaching an **open billing account** to the project. Nothing in this repo can work around that.

Consequently the two deploy workflows are **manual-only** (`workflow_dispatch`) rather than running on every push to `main`. They are kept as working reference: attach billing (or point them at your own GCP project), then trigger them from the Actions tab. Everything runs locally without any cloud account — see the [quick start](../README.md#quick-start).

`ci.yml` (tests) is unaffected and still runs on every push and pull request.

## Contents

1. [Configuration](#configuration)
2. [Continuous integration](#continuous-integration)
3. [Deploy workflows](#deploy-workflows)
4. [GitHub Actions — Variables](#github-actions--variables)
5. [GitHub Actions — Secrets](#github-actions--secrets)
6. [Bringing it back up](#bringing-it-back-up)

---

## Configuration

Configuration is **layered**: local dev uses `.env` files; cloud values are **never committed** — they flow from **GitHub Actions Variables / Secrets** → **Cloud Run env**, and from **GCP Secret Manager** for anything sensitive.

### Backend

| Variable | Detail |
|----------|--------|
| `STORE_BACKEND` | `memory` (default, tests) or `firestore`. |
| `GCP_PROJECT_ID` | Required when `STORE_BACKEND=firestore`. |
| `BOLNA_API_KEY`, `BOLNA_AGENT_ID` | From the Bolna console; in cloud, mounted via **Secret Manager**. |
| `BOLNA_API_BASE_URL` | Bolna REST origin. Empty default in app code — must be provided to call Bolna. |
| `DEMO_RECIPIENT_NUMBER` | Optional: route all demo calls to one verified MSISDN. |
| `BOLNA_WEBHOOK_SHARED_SECRET` | Optional weak guard for local dev. |
| `CORS_ORIGINS` | Comma-separated. **Cannot** be `*` while `allow_credentials=True` on FastAPI. |

Template: [`backend/.env.example`](../backend/.env.example).

### Frontend

| Variable | Detail |
|----------|--------|
| `BACKEND_API_URL` | **Server-only** — used by RSC and `src/lib/api.ts`. Never reaches the client bundle. |
| `NEXT_PUBLIC_BACKEND_API_URL` | Build-time/public mirror; keep equal to the browser-reachable API origin when client code needs it. |

Template: [`frontend/.env.example`](../frontend/.env.example). Local dev falls back to `http://localhost:8000` in `src/config/env.ts`; cloud always overrides via Cloud Run env / build args.

---

## Continuous integration

[`ci.yml`](../.github/workflows/ci.yml) runs on **every push and pull request** (all branches): **pytest** and **typecheck + ESLint + Vitest**, in parallel.

---

## Deploy workflows

| Workflow | Trigger | Pipeline |
|----------|---------|----------|
| [`deploy-backend.yml`](../.github/workflows/deploy-backend.yml) | manual | `docker build` → run container → **`GET /health` smoke** → push to `asia-south1-docker.pkg.dev/...` → `gcloud run deploy` |
| [`deploy-frontend.yml`](../.github/workflows/deploy-frontend.yml) | manual | Same → **`GET /api/health` smoke** (no backend dependency) → deploy |

**Preflight:** both workflows **fail fast** if a required GitHub Variable is empty — no silent defaults baked into source.

**Runtime injection:** plaintext config from `vars.*`; Bolna keys from GCP Secret Manager via `--set-secrets`. Secret *names* are fixed in the workflow — rotate the values in Secret Manager, not in git.

**Post-deploy:** each job prints the refreshed service URL into the Actions run summary (`gcloud run services describe ...`).

To restore auto-deploy on push, re-add a `push:` trigger to either workflow:

```yaml
on:
  push:
    branches: [main]
    paths:
      - "backend/**"                          # or frontend/**
      - ".github/workflows/deploy-backend.yml"
  workflow_dispatch:
```

---

## GitHub Actions — Variables

| Variable | Role |
|----------|------|
| `GCP_PROJECT_ID` | Project id in image URLs + backend `GCP_PROJECT_ID` |
| `GCP_REGION` | Cloud Run region + Artifact Registry hostname |
| `AR_REPO` | Docker repository id inside Artifact Registry |
| `BACKEND_CLOUD_RUN_SERVICE` | Backend Cloud Run service name |
| `FRONTEND_CLOUD_RUN_SERVICE` | Frontend Cloud Run service name |
| `STORE_BACKEND` | e.g. `firestore` on the backend service |
| `BOLNA_API_BASE_URL` | Bolna API host for the backend container |
| `CORS_ORIGINS` | Allowed browser origins (comma-separated; `deploy-backend` bundles them via the `^\|^` delimiter in `--set-env-vars`) |
| `BACKEND_API_URL` | FastAPI public URL for Next server-side fetches |
| `NEXT_PUBLIC_BACKEND_API_URL` | Docker build-arg + frontend service env mirror |

## GitHub Actions — Secrets

| Secret | Role |
|--------|------|
| `GCP_WIF_PROVIDER` | Workload Identity Federation provider resource string |
| `GCP_DEPLOY_SA` | Impersonated deployer service account |
| `BACKEND_RUNTIME_SA` | Identity of the **backend** Cloud Run revision (Firestore + secret accessor) |

---

## Bringing it back up

To deploy into a fresh GCP project of your own:

1. **Create the project** and **enable billing** on it (required even for free-tier usage — Cloud Run scales to zero, so idle cost is minimal).
2. **Enable APIs:** Cloud Run, Artifact Registry, Firestore, Secret Manager, IAM Credentials.
3. **Create an Artifact Registry** Docker repo in your region, and set `AR_REPO` / `GCP_REGION` to match.
4. **Create two service accounts:**
   - a **deployer** SA (`GCP_DEPLOY_SA`) with Cloud Run Admin, Artifact Registry Writer, and Service Account User;
   - a **backend runtime** SA (`BACKEND_RUNTIME_SA`) with Firestore access and Secret Manager Secret Accessor.
5. **Set up Workload Identity Federation** binding your GitHub repo to the deployer SA, and grant the WIF principal `roles/iam.serviceAccountTokenCreator` on it — a missing Token Creator binding is what surfaces as `iam.serviceAccounts.getAccessToken denied`.
6. **Create the secrets** in Secret Manager: `BOLNA_API_KEY`, `BOLNA_AGENT_ID`, `DEMO_RECIPIENT_NUMBER`.
7. **Populate** the GitHub Variables and Secrets tables above.
8. **Deploy the backend first**, note its URL, set `BACKEND_API_URL` / `NEXT_PUBLIC_BACKEND_API_URL` / `CORS_ORIGINS` accordingly, then deploy the frontend.
9. **Point Bolna's webhook** at `POST https://<your-backend-url>/webhooks/bolna`.

> **Note:** WIF providers are commonly scoped to a specific `assertion.repository`. If you rename the GitHub repo, update that attribute condition or the OIDC token will stop matching.
