# Design Pattern

## Purpose

This document is the implementation companion to `design.md`. It defines how UI is composed, how data flows, and how features are structured so any contributor can extend the dashboard without breaking consistency.

## Core UI Architecture

- Server-first rendering: every route's `page.tsx` is a Server Component that fetches initial data via a server-side library in `lib/*-server.ts` and passes it to a Client Container as `initialData`.
- Client Container holds React Query, mutations, and derived view state. Presentational components are dumb prop sinks.
- Mutations always go through Next.js route handlers under `app/api/[feature]/...` — never call the FastAPI backend directly from a Client Component.
- All API responses (route handlers and server libs) follow the `ApiSuccessResponse<TData> | ApiErrorResponse` envelope.

## shadcn/ui Usage

- Primitives live in `components/ui/`. Treat them as installed source — extend variants there only when at least two feature components need the same extension (e.g. add `success` and `warning` to `Badge`).
- Do not fork a primitive when wrapping it in `components/<feature>/` is enough. Example: `components/orders/StatusBadge.tsx` wraps `Badge` and centralises the status-to-variant mapping.
- Install missing primitives with the CLI:

```bash
npx shadcn@latest add <component>
```

## Page Composition

A protected (or public) page must follow this skeleton:

```tsx
// app/<route>/page.tsx
import { listOrders } from "@/lib/orders-server";
import { OrdersContainer } from "@/components/orders";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const initialOrders = await listOrders();
  return <OrdersContainer initialOrders={initialOrders} />;
}
```

Rules:

1. `page.tsx` is thin: data fetch + container render. No JSX besides the container.
2. Use `export const dynamic = "force-dynamic"` whenever the data depends on cookies, headers, env, or user-specific state.
3. Pass server-fetched data as `initialData` to the container; never start with a client-only loading state if the server can render it.
4. `params` is a `Promise` in Next.js 16 — always `await params` before destructuring.

## Section Composition

Within a route, the container composes sections in this order:
1. Header (title + global actions)
2. Toolbar (search / filters / status chips)
3. Primary surface (table / detail block)
4. Footer (pagination — absent today)

Each section is a leaf component named for its purpose (`Toolbar.tsx`, `List.tsx`, etc.) and lives under `components/<feature>/`.

## Content Hierarchy

In every row / card:
1. Identifier (Order ID, mono)
2. Subject (customer name, product summary)
3. Value (numeric, right-aligned, mono)
4. State (status badge)
5. Actions (right-most)

Reverse this order for detail views: state and actions at the top, identifier and metadata below.

## Navigation Patterns

- Single screen at `/` for v1. No sidebar, no global tabs.
- Detail surface uses a modal first; standalone routes (`/orders/[id]`) exist for shareable URLs.
- Use `next/link` for in-app navigation; never plain `<a>` for internal routes.

## CTA Patterns

- One primary CTA per surface. On the dashboard the primary CTA is `Verify` per row. Secondary actions (`View`) are `ghost`.
- In the detail dialog the primary CTA is `Refresh from Bolna`; secondary is `Open recording`.

## Button Patterns

| Use case | Variant | Size |
| --- | --- | --- |
| Primary row action | `default` | `sm` |
| Secondary row action | `ghost` | `sm` |
| Destructive | `destructive` | `sm` |
| Toolbar actions | `outline` | `sm` |
| Icon-only utilities | `ghost` | `icon-sm` |

Buttons that trigger mutations must:
- show an inline spinner from `lucide-react` (`Loader2`)
- be disabled during the in-flight call
- recover the original label on success or error

## Card Patterns

- Card anatomy: `<Card>` → `<CardHeader>` (title + optional action) → `<CardContent>` → optional `<CardFooter>`.
- Use cards on the detail page for grouped key/value data; never on the list view.
- Two columns on `md+` for compact key/value cards (`grid grid-cols-1 md:grid-cols-2 gap-4`).

## Form Patterns

- Field wrapper: label above input, helper text below, error text replaces helper on validation failure.
- Group related fields with `space-y-4`; group sections with `Separator`.
- Submit button right-aligned in modals, full-width on mobile.
- Validate on blur and on submit; never on every keystroke for v1.

## Table and List Patterns

- The orders dashboard uses shadcn `Table`.
- Wrap the table in `<Card>` for visual containment when filters live in `Toolbar`.
- One row click target may navigate to detail; if so, also expose a button so keyboard / screen-reader users can act without relying on row click.
- Below `md`, render the same data as a stacked list — see `design.md#responsive-design`.

## State Patterns

Container return order is fixed:

```tsx
if (isPending) return <ListSkeleton />;
if (isError && !data) return <ErrorState message={errorMessage} />;
if (!data || data.length === 0) return <EmptyState />;
return <List items={data} />;
```

Rules:
- Prefer stale data over a hard error reset during background refetch.
- Mutation errors → toast via `sonner`, do not blow away the table.
- Optimistic UI is allowed for verify (status flips to `verifying` immediately) but only when the mutation is reversible by an invalidate.

## Route-Level Consistency Rules

- Every route uses the same page header layout (title left, actions right).
- Every route's container exports `default` and lives at `components/<feature>/index.tsx`.
- Every route has a `README.md` next to its container documenting purpose, data flow, and extension hooks.
- Every list view has a Loading, Error, and Empty state. No exceptions.

## Presentational vs Container Guidance

- Container (`components/<feature>/index.tsx`):
  - `'use client'`
  - Owns `useFooQuery`, `useFooMutations`
  - Owns derived view state (filters, search, selection)
  - Owns toast invocations
- Presentational (`Toolbar.tsx`, `List.tsx`, `Row.tsx`, `EmptyState.tsx`):
  - Receive props only
  - May hold local UI state (e.g. `useState` for a controlled input)
  - Emit events upward via callback props (`onVerify`, `onRefresh`)
  - Never call hooks that touch global data

## Preferred Reusable Components

When extending, prefer these patterns first:
- `StatusBadge` for any order/call state mapping
- `OutcomeBadge` for outcome tags
- `EmptyState` for empty list surfaces
- `KeyValue` (when introduced) for detail key/value blocks

If a pattern is reused twice, promote it to a reusable component before the third use site lands.

## Anti-Patterns

- Inlining `fetch('/api/...')` in components (use a hook).
- Storing query keys as inline string arrays (use `query-keys/orders.ts`).
- Adding a new color or font without updating `design.md`.
- Mixing route handler responses (raw arrays vs envelopes) — always use the envelope.
- Importing a primitive from `components/ui/` and re-styling its base classes; create a wrapper instead.
- Creating one mega-container per route. If `index.tsx` is over ~150 lines, split into Toolbar/List/Row.

## Safe Extension Guidance

To add a new feature route:
1. Create `app/<route>/page.tsx` (Server Component, thin) and `lib/<feature>-server.ts` for the server fetch.
2. Create `app/api/<feature>/route.ts` for client mutations / refresh.
3. Create `query-keys/<feature>.ts` and hooks under `hooks/`.
4. Build `components/<feature>/index.tsx` (container) and presentational siblings.
5. Add `components/<feature>/README.md` with route URL, data flow, and extension hooks.
6. Update `design.md` only if a new visual primitive (color, badge variant, layout) was introduced.
