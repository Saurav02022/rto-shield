<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may differ from older Next.js habits. Read the relevant guide in `node_modules/next/dist/docs/` before writing or changing framework-level code, and heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project Agent Guidelines

This file is the reusable house standard for projects built with:

- Next.js App Router
- TypeScript
- Supabase
- React Query / TanStack Query
- Tailwind CSS
- shadcn/ui

Use it as the default operating guide across projects with this stack.

## Applicability

- Treat this file as the default standard across repos using the stack above.
- If a repo already has an established structure, extend that structure instead of forcing a rewrite.
- If a repo has additional local docs such as `design.md`, `design-pattern.md`, or route `README.md` files, those docs take priority for repo-specific details.
- Examples in this file use placeholder names like `[feature]`, `[entity]`, and `[route]`. Replace them with names that match the current project.

## Contents

**Working Model**

- [How AI Should Work on This Project](#how-ai-should-work-on-this-project)
- [Git Workflow](#git-workflow)
- [Commit Message Convention](#commit-message-convention)

**Documentation**

- [Mandatory Reading Before Any UI Work](#mandatory-reading-before-any-ui-work)
- [Route or Feature Documentation](#route-or-feature-documentation)
- [Design Documentation Structure](#design-documentation-structure)

**Architecture**

- [Preferred Tech Stack](#preferred-tech-stack)
- [Preferred Folder & File Structure](#preferred-folder--file-structure)
- [Page & Route Conventions](#page--route-conventions)
- [Auth Guard Pattern](#auth-guard-pattern)
- [Loading, Error, and Empty States](#loading-error-and-empty-states)

**Data and APIs**

- [Database Types](#database-types)
- [Data Fetching](#data-fetching)
- [API Response Shape](#api-response-shape)
- [React Query Keys](#react-query-keys)
- [Promise & Async Handling](#promise--async-handling)

**UI System**

- [shadcn/ui Rules](#shadcnui-rules)
- [Component Pattern — Presentational / Container](#component-pattern--presentational--container)

**Code Quality**

- [Imports](#imports)
- [Naming Conventions](#naming-conventions)
- [Export Convention](#export-convention)
- [Logging](#logging)
- [Commenting Rules](#commenting-rules)
- [TypeScript Rules](#typescript-rules)
- [General Coding Rules](#general-coding-rules)

---

## Workflow

### How AI Should Work on This Project

For every non-trivial task, follow this sequence:

1. Restate the request briefly in your own words
2. Inspect the current repo before deciding on patterns
3. Clarify only if a missing answer would materially change the implementation
4. Propose the approach before implementation
5. For medium, large, or structural changes, include a brief HLD or LLD
6. Wait for approval before implementing any non-trivial UI, architecture, data, auth, or multi-file change
7. Implement in small, reviewable steps
8. Verify with lint, tests, or focused manual checks when possible

**Rules:**

- Do not start inventing structure before reading the current codebase
- Treat approval-first as the default project discipline, not an optional extra
- For very small single-file edits, use judgment, but keep the same structure and standards
- For larger architecture, auth, database, or UI-system changes, explain the approach before editing
- Prefer existing repo patterns over abstract best practices when the repo is already coherent

### Git Workflow

Git discipline should follow the same consistency as the codebase.

#### Branching

- Use a separate branch for each logical unit of work unless the repo workflow explicitly says otherwise
- Branch names should be short, descriptive, and consistent
- Prefer patterns such as:
  - `feat/[feature-name]`
  - `fix/[feature-name]`
  - `refactor/[feature-name]`
  - `docs/[topic]`
  - `chore/[topic]`
- Do not mix unrelated work in the same branch
- If a task grows into multiple unrelated changes, split it into separate branches

#### When to Commit

- Commit when one logical unit of work is complete and reviewable
- Commit related docs changes with the code they describe when they are part of the same change
- Commit before risky refactors or larger follow-up steps when a stable checkpoint has been reached
- Do not create one giant commit for multiple unrelated concerns
- Do not commit broken placeholder work unless the branch is explicitly draft-only and the team expects that

#### When to Push

- Push when the branch reaches a stable checkpoint
- Push before asking for review or handoff
- Push before switching context for a long time if the work should not remain only on the local machine
- Do not push obviously broken code, failed basic checks, or incomplete scaffolding unless the workflow explicitly allows draft pushes

#### Pre-Push Checklist

Before pushing:

1. Run lint or the relevant static checks
2. Run tests relevant to the changed area when they exist
3. Verify docs were updated if UI, route behavior, data flow, or API contracts changed
4. Check that route `README.md`, `design.md`, or `design-pattern.md` were updated when required
5. Make sure commit boundaries still reflect logical units of work

#### Review and Handoff

- Push branches in a reviewable state
- Keep commit history understandable, even if it is later squashed
- Summaries for review should explain what changed, why it changed, and anything the reviewer should verify manually
- If UI changed materially, include screenshots or route references when the workflow supports it
- If API shape changed, call that out explicitly in the review summary

### Commit Message Convention

Every commit should follow:

```text
<type>(<scope>): <short summary>

<body — what changed and why>

<footer — issue or breaking change, if any>
```

**Types:**

| Type       | When to use                                                              |
| ---------- | ------------------------------------------------------------------------ |
| `feat`     | New feature or user-facing behavior                                      |
| `fix`      | Bug fix                                                                  |
| `refactor` | Code restructuring without changing intended behavior                    |
| `style`    | UI or styling only, no logic change                                      |
| `docs`     | Documentation only                                                       |
| `chore`    | Tooling, dependency, config, or maintenance work                         |
| `test`     | Adding or updating tests                                                 |
| `perf`     | Performance improvement                                                  |

**Scope rules:**

- Use a real feature, domain, or shared area name
- Keep it lowercase and short
- Prefer scopes like `auth`, `[feature]`, `api`, `hooks`, `lib`, `ui`, `config`, `agents`

**Examples:**

```text
feat(users): add server-filtered member search
fix(api): return 400 for invalid pagination params
refactor(lib): split profile mapper from supabase query
docs(agents): generalize stack rules for reusable projects
```

**Commit rules:**

- Summary line max 72 characters
- Use imperative mood
- One logical change per commit
- Never use vague messages like `fix`, `update`, `changes`, or `wip`

---

## Documentation

### Mandatory Reading Before Any UI Work

Before writing UI code:

1. Read `design.md` fully
2. Read `design-pattern.md` fully
3. Read the route `README.md` for the page you are working on
4. Inspect the current route, layout, reusable components, and global styles
5. Reuse established tokens, spacing, typography, and component patterns before creating anything new

**Non-negotiable rules:**

- `design.md` and `design-pattern.md` must exist in every UI project using this standard
- If either file is missing, create it before doing UI implementation
- If either file is stale, incomplete, or no longer reflects the codebase, update it as part of the task
- UI work must follow these files once they exist
- These files are living source-of-truth documents, not optional extras

### Route or Feature Documentation

Every route must have a `README.md` that acts as the working doc for that page or route segment.

**Preferred location:**

- Keep the route README beside the route UI implementation, typically at `src/components/[feature]/README.md`
- If a repo uses deeper route folders, place the README at the smallest route-owned component folder that represents the page
- Do not split one route's implementation notes across multiple docs unless the route is genuinely large and nested

**Minimum documentation bar:**

- Route location and public URL
- Linked `page.tsx` entry
- Linked component folder
- Problem statement
- Access and guards
- Data flow
- Container and presentational file map
- Loading, empty, and error behavior
- Notes for safe extension

**Rules:**

- Before working on a route, read that route's `README.md` first
- If the route does not have a `README.md`, create it before making substantial route changes
- If the README is stale, incomplete, or no longer matches the implementation, update it as part of the task
- When creating a new route, create its `README.md` in the same task
- Do not treat route docs as optional after implementation
- Do not create docs that only restate filenames without explaining responsibilities

### Design Documentation Structure

`design.md` and `design-pattern.md` must follow a consistent structure across projects.

**Standardization rules:**

- If the files do not exist, create them using the required structure below
- If the files exist but use a different structure, reorganize them to match the required structure
- Keep the content repo-specific, but keep the document shape consistent across projects
- Do not create duplicate sections with similar names; merge them into the standard headings
- Missing required sections must be added
- Empty placeholder sections are not acceptable; each section must contain real guidance based on the repo
- Extra project-specific sections are allowed only if they are truly needed and should appear after the required sections or as nested subsections

**`design.md` required top-level structure:**

```md
# Design

## Purpose
## Design Intent
## Visual Tone
## Color System
## Typography
## Spacing and Layout
## Surfaces, Borders, Radius, and Shadows
## Navigation
## Section Design
## Buttons and Links
## Cards and Lists
## Forms
## Tables and Data Display
## Media and Imagery
## Responsive Design
## Accessibility
## Motion and Interaction
## Loading, Error, and Empty States
## Do / Don't
## Direction to Preserve
```

**`design.md` section expectations:**

- `Purpose`: what the document controls and how contributors should use it
- `Design Intent`: product and UX direction the repo is aiming to preserve
- `Visual Tone`: practical visual character, not brand fluff
- `Color System`: actual usage rules, semantic roles, and contrast guidance
- `Typography`: font usage, hierarchy, scale, and emphasis rules
- `Spacing and Layout`: spacing rhythm, container widths, grids, and section spacing
- `Surfaces, Borders, Radius, and Shadows`: how cards, panels, separators, and elevation work
- `Navigation`: header, sidebar, breadcrumbs, tabs, footer, and route discovery patterns if relevant
- `Section Design`: how pages and sections should be composed visually
- `Buttons and Links`: priority, variants, density, and placement rules
- `Cards and Lists`: repeated item patterns, row/card choice, and density rules
- `Forms`: labels, helper text, validation, grouping, and submit behavior
- `Tables and Data Display`: tables, stats, key-value blocks, and overflow handling
- `Media and Imagery`: image treatment, aspect ratio, fallback, and caption rules if relevant
- `Responsive Design`: breakpoints, stacking rules, layout collapse behavior, and mobile priorities
- `Accessibility`: keyboard support, semantics, color contrast, focus, and screen-reader expectations
- `Motion and Interaction`: hover, focus, open/close, async feedback, and transition rules
- `Loading, Error, and Empty States`: visual and UX rules for each state
- `Do / Don't`: concrete patterns to repeat and patterns to avoid
- `Direction to Preserve`: what future contributors should protect even as the system evolves

**`design-pattern.md` required top-level structure:**

```md
# Design Pattern

## Purpose
## Core UI Architecture
## shadcn/ui Usage
## Page Composition
## Section Composition
## Content Hierarchy
## Navigation Patterns
## CTA Patterns
## Button Patterns
## Card Patterns
## Form Patterns
## Table and List Patterns
## State Patterns
## Route-Level Consistency Rules
## Presentational vs Container Guidance
## Preferred Reusable Components
## Anti-Patterns
## Safe Extension Guidance
```

**`design-pattern.md` section expectations:**

- `Purpose`: what implementation decisions this document governs
- `Core UI Architecture`: broad composition approach for the repo
- `shadcn/ui Usage`: how shared primitives should be used, wrapped, and extended
- `Page Composition`: route-level assembly rules
- `Section Composition`: repeatable section layouts and internal structure
- `Content Hierarchy`: titles, supporting text, actions, metadata, and density ordering
- `Navigation Patterns`: tabs, pagination, filters, breadcrumbs, sidebars, and local navigation patterns
- `CTA Patterns`: where primary and secondary actions belong
- `Button Patterns`: when to use each button variant and size
- `Card Patterns`: standard card anatomy, spacing, and interaction patterns
- `Form Patterns`: field grouping, validation flow, modal vs page form rules
- `Table and List Patterns`: when to use table, list, grid, accordion, or cards
- `State Patterns`: loading, empty, error, disabled, optimistic, and success handling
- `Route-Level Consistency Rules`: what should remain consistent across routes
- `Presentational vs Container Guidance`: where state, hooks, and rendering responsibilities live
- `Preferred Reusable Components`: which shared patterns contributors should prefer first
- `Anti-Patterns`: patterns that should not be repeated
- `Safe Extension Guidance`: how to add new UI without breaking consistency

**Normalization workflow for existing files:**

1. Read the existing file fully
2. Map current sections to the nearest required headings
3. Rename and reorder sections to match the standard structure
4. Merge duplicate or overlapping sections
5. Fill missing sections with repo-specific guidance derived from the current codebase
6. Remove generic filler that does not help future implementation
7. Keep examples aligned with the actual repo

Before substantial UI work, verify both files still match this structure. If not, normalize them first, then implement the UI.

---

## Architecture

### Preferred Tech Stack

Preferred default stack:

- Next.js App Router
- TypeScript
- Supabase for auth and database
- React Query / TanStack Query for client-side data fetching and mutations
- Tailwind CSS
- shadcn/ui in `src/components/ui`
- `lucide-react` for icons

**Rules:**

- If the repo has not installed part of this stack yet, follow the same pattern when introducing it
- Use the shadcn style configured in `components.json`; do not hardcode a style name in docs unless the repo requires it
- Follow the actual repo dependencies first if they intentionally differ

### Preferred Folder & File Structure

Use this as the default structure for new projects with this stack. If the repo already has a stable structure, follow it rather than forcing migration.

```text
src/
├── app/                          # Next.js App Router pages, layouts, route handlers
│   ├── (routes)/
│   │   └── [feature]/
│   │       └── page.tsx
│   ├── api/
│   │   └── [feature]/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn installed files
│   └── [feature]/
│       ├── index.tsx             # Container entry
│       ├── Toolbar.tsx
│       ├── List.tsx
│       ├── Card.tsx
│       └── README.md             # Required route or feature doc
├── config/                       # App config, route constants, env mapping
├── constants/                    # Static constants, no runtime logic
├── contexts/                     # React contexts
├── data/                         # Static data, fixtures, seeds
├── fonts/                        # Local font files and font config
├── hooks/                        # React Query hooks and client hooks
├── lib/                          # Server utilities, Supabase clients, helpers
├── providers/                    # Query client, theme, app providers
├── query-keys/                   # React Query key factories
├── scripts/                      # One-off scripts, codegen, maintenance tasks
├── store/                        # Minimal client-side global state
├── styles/                       # Optional style helpers or overrides
├── types/                        # Shared TS types
│   └── database.generated.ts     # Generated Supabase types
└── utils/                        # Pure stateless helper functions
```

**Rules:**

- `src/app` is for routing concerns, not reusable UI
- `src/components/ui` is for shadcn-generated components only
- `src/components/[feature]` is for feature UI
- `src/config` is for route constants, environment-specific config, and app configuration
- `src/lib` is for server helpers, integrations, mappers, and domain utilities
- `src/hooks` is for client hooks only
- `src/contexts` is for React context definitions
- `src/providers` is for app-level providers
- `src/query-keys` holds all query key factories; never inline query keys in components
- `src/constants` is for shared constants; avoid scattering magic values inline
- `src/data` is for static or seeded data only
- `src/scripts` is for scripts and codegen, never imported by app runtime
- `src/store` should stay minimal and only hold state that does not fit React Query or local component state
- `src/types/database.generated.ts` is generated; never edit manually

### Page & Route Conventions

**Server vs Client Components**

- `page.tsx` should stay a Server Component by default
- Only add `'use client'` to components that need hooks, event handlers, or browser APIs
- Do not move data fetching into presentational Client Components
- Prefer server data fetch + prop passing for the first render

**What belongs in `page.tsx`**

For public static routes:

1. Optional metadata or route config
2. Server-side data fetch if needed
3. Render the route container or page UI

For protected or user-specific routes:

1. Session or auth guard
2. Role or profile guard if needed
3. Server-side data fetch
4. Pass props to the route container

**Default rule:**

- `page.tsx` should stay as thin as possible
- It should orchestrate routing, guards, server fetches, and prop passing
- It should not become a large JSX file or business-logic module
- If a public route does not need auth or data fetch, it may render directly, but it should still stay thin

**Rendering and caching**

- Use `export const dynamic = "force-dynamic"` for pages that depend on auth, cookies, headers, or user-specific data
- Use static rendering only when the route is truly public and cache-safe
- Use the server Supabase client in Server Components and server utilities
- Keep route handlers and RSC fetches explicit about cache behavior when correctness matters

### Auth Guard Pattern

Use this pattern for protected pages. Rename imports and routes to match the repo.

```tsx
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase-server";
import { getCurrentUserProfile } from "@/lib/user-profile-server";
import { PAGE_ROUTES } from "@/config/routes";
import { USER_ROLE } from "@/constants/roles";
import FeatureContainer from "@/components/[feature]";
import { getFeatureData } from "@/lib/[feature]-server";

export const dynamic = "force-dynamic";

export default async function FeaturePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PAGE_ROUTES.signIn);
  }

  const profile = await getCurrentUserProfile(user.id);

  if (!profile) {
    redirect(PAGE_ROUTES.completeProfile);
  }

  if (profile.role !== USER_ROLE.ADMIN) {
    redirect(PAGE_ROUTES.home);
  }

  const data = await getFeatureData({ userId: user.id });

  return <FeatureContainer initialData={data} profile={profile} />;
}
```

**Rules:**

- Use route constants instead of hardcoded path strings
- Use role constants instead of hardcoded role strings
- Keep guards before data fetch when the data depends on the guard passing
- Do not bury redirect logic deep inside presentational components

### Loading, Error, and Empty States

Prefer route-level loading transitions at the app level and feature-level loading in the container.

**Container return order:**

1. Loading
2. Error
3. Empty
4. UI

```tsx
export default function FeatureContainer({ initialData }: FeatureContainerProps) {
  const { data, isLoading, isError, error } = useFeatureQuery({ initialData });

  if (isLoading) {
    return <FeatureSkeleton />;
  }

  if (isError && !data) {
    return <ErrorState message={error instanceof Error ? error.message : "Something went wrong."} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return <List items={data} />;
}
```

**Rules:**

- Prefer stale data over replacing visible UI with a hard error state
- Use toast notifications for transient mutation errors
- Do not use `window.alert()`
- Reuse shared loading, empty, and error patterns across routes

---

## Data and APIs

### Database Types

Generated Supabase types are the source of truth.

```ts
import type { Database } from "@/types/database.generated";

type EntityRow = Database["public"]["Tables"]["entities"]["Row"];
type EntityInsert = Database["public"]["Tables"]["entities"]["Insert"];
type EntityUpdate = Database["public"]["Tables"]["entities"]["Update"];
```

**Rules:**

- Never hand-write database row shapes that already exist in generated types
- Use `Row`, `Insert`, and `Update` appropriately
- Extend generated types explicitly for UI-only fields
- Regenerate the file when the schema changes; do not patch it by hand

### Data Fetching

**Server reads**

- Prefer server-side reads in `page.tsx` or `@/lib/*-server`
- Keep Supabase query code in server utilities, not scattered through UI files
- Throw explicit errors from server utilities
- Keep fetch helpers focused on fetching; shape data in mappers when needed
- Mirror domain structure consistently across route, API, hooks, and query keys
- The default first render should come from server-fetched data, not a client loading state
- Render the page with server data first, then hand that data to the client layer if revalidation is needed

```ts
import { createClient } from "@/lib/supabase-server";
import type { Database } from "@/types/database.generated";

type EntityRow = Database["public"]["Tables"]["entities"]["Row"];

export async function listEntities(): Promise<EntityRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("entities").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

**Client mutations**

- All client-triggered API calls must go through route handlers in `src/app/api`
- Wrap API calls inside React Query hooks in `src/hooks`
- Do not call `fetch("/api/...")` directly inside random components unless the component is the hook owner and the repo already uses that pattern

**Client-side refetch and revalidation**

- If a route needs client-side refetch, polling, filter-driven refresh, pagination, or mutation-driven invalidation, use React Query
- Seed React Query with the server-fetched `initialData` so the page renders immediately with server data
- Use React Query after first render for revalidation and client freshness, not as the default replacement for server rendering
- The first load should not depend on a client-only request when the page can be rendered on the server

**API route method discipline**

- Route handlers under `src/app/api/` should use only the methods the project standard supports: `GET`, `POST`, `PATCH`, and `DELETE`
- `GET` route handlers are for client-side fetches, revalidation, pagination, filtering, and other client refresh cases
- `POST`, `PATCH`, and `DELETE` route handlers are for client-triggered mutations
- Keep API route shape consistent across projects unless a repo has a deliberate documented exception

**Preferred mirroring pattern:**

```text
UI Route:   src/app/[feature]/page.tsx
UI Folder:  src/components/[feature]/
API Route:  src/app/api/[feature]/route.ts
Query Hook: src/hooks/use[Feature]Query.ts
Hook:       src/hooks/use[Feature]Mutations.ts
Query Key:  src/query-keys/[feature].ts
Server Lib: src/lib/[feature]-server.ts
```

**Preferred rendering pattern:**

1. `page.tsx` fetches data on the server
2. `page.tsx` renders the route with that server data
3. the container passes `initialData` into the React Query hook when client revalidation is needed
4. React Query revalidates, refetches, and invalidates through `src/app/api/[feature]/route.ts`

### API Response Shape

All responses returned from `src/app/api/` route handlers should follow one consistent envelope unless the route has a documented exception.

**Success response shape:**

```ts
type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
  message?: string;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    [key: string]: unknown;
  };
};
```

**Error response shape:**

```ts
type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

**Combined response shape:**

```ts
type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;
```

**Example success response:**

```json
{
  "success": true,
  "data": [{ "id": "1", "title": "Notice" }],
  "message": "Notices fetched successfully",
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 42
  }
}
```

**Example error response:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUERY_PARAMS",
    "message": "The provided pagination parameters are invalid."
  }
}
```

**Rules:**

- Always return JSON in a predictable envelope from `src/app/api/`
- Use `success: true` for successful responses and `success: false` for failed responses
- Put primary payloads inside `data`
- Put human-readable failures inside `error.message`
- Put machine-friendly failure identifiers inside `error.code`
- Use `meta` only when the route returns extra transport information such as pagination, counts, cursors, or filter summaries
- Do not return ad hoc mixtures like `{ result: ... }`, `{ items: ... }`, `{ ok: true }`, or raw arrays from one route and wrapped objects from another
- Keep response shapes stable across projects so hooks and components can rely on one contract

**Status code discipline:**

- `200` for successful reads and updates
- `201` for successful creates when a new resource is created
- `400` for invalid input
- `401` for unauthenticated requests
- `403` for unauthorized requests
- `404` for missing resources
- `409` for conflicts
- `500` for unexpected server errors

**Client-side handling rules:**

- React Query hooks should parse this envelope and expose clean UI-facing values
- UI components should not have to understand multiple backend response shapes
- Route handlers should normalize upstream or Supabase errors into this contract before returning them

### React Query Keys

Keep all query keys in `src/query-keys`.

```ts
export const entityKeys = {
  all: ["entities"] as const,
  lists: () => [...entityKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...entityKeys.lists(), filters] as const,
  detail: (id: string) => [...entityKeys.all, "detail", id] as const,
};
```

**Rules:**

- Never inline large query keys in components
- Keep key factories close to the domain
- Match invalidation logic to the same key factory

### Promise & Async Handling

- Always handle Supabase responses as `{ data, error }`
- Throw or surface errors deliberately; never swallow them
- Distinguish initial load from background refetch
- Prefer showing existing data during refetch over resetting the whole screen
- Seed React Query with server-fetched initial data when the route needs fast hydration and stable first paint

---

## UI System

### shadcn/ui Rules

Before creating UI:

1. Check `src/components/ui`
2. Check the official shadcn docs
3. Install missing primitives with the shadcn CLI
4. If no shadcn component exists, compose with existing primitives and Tailwind

```bash
npx shadcn@latest add <component-name>
```

**Rules:**

- Never copy shadcn source manually
- Do not fork a shadcn component when composition or wrapper components will do
- Avoid editing generated shadcn files unless the repo intentionally treats them as owned source
- Prefer feature wrappers around shared primitives instead of stuffing feature-specific logic into `src/components/ui`

### Component Pattern — Presentational / Container

Default pattern:

- Container owns hooks, state, mutations, derived view state, and data wiring
- Presentational components receive props and render UI
- Presentational components may hold small UI-only state

**Preferred structure:**

```text
src/components/[feature]/
├── index.tsx
├── Toolbar.tsx
├── List.tsx
├── Card.tsx
├── EmptyState.tsx
└── README.md
```

**Rules:**

- Keep business logic out of small leaf components
- Keep route containers focused; split when a file becomes too broad
- Do not create a container/presentational split for tiny single-purpose components unless it improves clarity

---

## Code Quality

### Imports

- Always prefer the `@/` alias for `src`
- Do not use deep relative imports when an alias exists
- Omit `.ts` and `.tsx` extensions in imports
- Keep imports grouped:
  1. External packages
  2. Internal aliases
  3. Relative imports
- Use `import type` for type-only imports where practical

**Rules:**

- Relative imports are acceptable only inside the same small feature folder when they improve readability
- Do not use relative imports to cross feature boundaries

### Naming Conventions

**Files and folders**

| What                  | Convention                                  |
| --------------------- | ------------------------------------------- |
| Feature folders       | `kebab-case`                                |
| Component files       | `PascalCase`                                |
| Container entry file  | `index.tsx`                                 |
| Hook files            | `camelCase` with `use` prefix               |
| Server helper files   | `camelCase` with `-server` suffix           |
| Query key files       | `camelCase`                                 |
| Constant files        | `camelCase`                                 |
| Type files            | `camelCase`                                 |
| API route files       | `route.ts`                                  |

**React Query naming**

| What                  | Convention                                  |
| --------------------- | ------------------------------------------- |
| Query hook            | `use[Feature]Query`                         |
| Infinite query hook   | `use[Feature]InfiniteQuery`                 |
| Mutation hook         | `use[Feature]Mutations`                     |
| Query key factory     | `[feature]Keys`                             |

**Code identifiers**

| What                  | Convention                                  |
| --------------------- | ------------------------------------------- |
| Variables             | `camelCase`                                 |
| Functions             | verb-first `camelCase`                      |
| Booleans              | `is`, `has`, `can`, `should` prefixes       |
| Components            | `PascalCase`                                |
| Props interfaces      | `PascalCase` + `Props`                      |
| Type aliases          | `PascalCase`                                |
| DB row types          | `PascalCase` + `Row`                        |
| DB insert types       | `PascalCase` + `Insert`                     |
| DB update types       | `PascalCase` + `Update`                     |
| Constants             | `SCREAMING_SNAKE_CASE`                      |

**General naming rules**

- Prefer full words over abbreviations
- Make names domain-specific and readable
- Do not repeat the folder name in every local component file if the folder already provides context
- Keep naming stable across route, hook, query key, lib, and component boundaries

### Export Convention

- `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and route entry files use the export shape Next.js expects
- Feature `index.tsx` container files use `default export`
- Utility, hook, constant, and query-key files use named exports
- Keep generated shadcn exports in the form generated by the CLI
- Do not rename default imports casually; keep import names aligned with file names

**Rules:**

- One component per component file unless there is a clear local helper reason
- Keep export style consistent within the same layer of the app

### Logging

Use logging intentionally, not mechanically.

**Log when it helps:**

- Server utilities
- Auth guards
- Route handlers
- Complex mutations
- Non-trivial control flow

**Avoid logging in:**

- Tiny presentational components
- Straightforward pure utilities unless debugging warrants it

**Rules:**

- Prefer structured, searchable prefixes like `[feature-server]`, `[FeatureContainer]`, `[api/feature]`
- Log inputs, branch decisions, and failure points when debugging value is high
- Do not fill every file with noise logs just to satisfy a rule
- Follow repo production logging policy when one exists
- Log page guards, route handlers, server fetches, and non-trivial mutations consistently across projects

### Commenting Rules

- Add comments for intent, edge cases, and non-obvious decisions
- Explain why, not what
- Add module-level comments only when the module is non-trivial
- Add JSDoc for exported functions or components when it materially improves maintainability
- Do not write comments that simply narrate the code line by line

**Discipline rules:**

- Shared utilities, server helpers, route containers, and reusable components should be documented more carefully than one-off leaf nodes
- Guard order, cache behavior, pagination assumptions, and mutation side effects should always be explained when they are not obvious

### TypeScript Rules

- Avoid `any`; prefer `unknown` plus narrowing
- Prefer explicit types at API boundaries
- Keep prop types and hook argument types named and reusable
- Minimize unsafe casts
- Derive database types from generated Supabase types whenever possible

### General Coding Rules

- Keep functions focused
- Keep components reasonably small and composable
- Prefer simple code over clever code
- Do not use overloaded functions when separate named functions or optional params are clearer
- Do not over-abstract on first implementation
- Reuse existing patterns before creating new ones
- Do not hardcode route strings, role strings, status values, or repeated constants when shared constants already exist
- Do not leave TODOs, placeholder logic, or unfinished scaffolding in production-facing code
- Ship finished code, not placeholder architecture
