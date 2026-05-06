# Orders feature

Operational dashboard for the RTO Shield workflow. Single screen lists every order awaiting pre-dispatch verification and lets the user trigger a Bolna voice call per row.

## Routes

- `/` — list view (this feature is the home page for the demo)
- `/orders/[id]` — detail view (shareable URL); the same data is also available via the `DetailDialog` in the list view

## Files

| File | Responsibility |
| --- | --- |
| `index.tsx` | Container — owns React Query, mutations, selection state, toasts |
| `Toolbar.tsx` | Header + refresh-all action |
| `List.tsx` | Table shell |
| `Row.tsx` | Order row with `Verify` + `View` buttons |
| `StatusBadge.tsx` | Order status → colored badge |
| `OutcomeBadge.tsx` | Last call outcome → colored badge |
| `DetailDialog.tsx` | Modal showing transcript, summary, captured fields, refresh action |
| `EmptyState.tsx` | Friendly nudge when the list is empty |

## Data flow

1. `app/page.tsx` (Server Component) calls `listOrders()` from `lib/orders-server.ts` and passes `initialOrders` to `OrdersContainer`.
2. The container hydrates React Query via `useOrdersQuery({ initialData })`.
3. Per-row `Verify` triggers `useOrderMutations().verify`, which posts to `/api/orders/[id]/verify` → backend `/orders/{id}/verify`.
4. Detail dialog `Refresh from Bolna` posts to `/api/orders/[id]/refresh` → backend `/orders/{id}/refresh`, which fetches the latest execution from Bolna and re-applies the outcome.
5. Both mutations invalidate `orderKeys.lists()` so the table reflects the new state.

## Loading, empty, and error behavior

- Loading: server-rendered first paint; React Query refetches in the background. No skeleton needed for v1.
- Empty: `EmptyState` shown when `items.length === 0`.
- Error: toast via `sonner`; the list keeps showing stale data so the operator never loses context.

## Notes for safe extension

- Add a new derived view (e.g. filter by status) by computing inside `index.tsx` and passing the filtered list to `List`. Do not push filter state into `List`; keep that component dumb.
- A new column should:
  1. Add the value to `lib/types.ts` (mirror of backend Pydantic).
  2. Add a `<TableHead>` in `List.tsx` and a `<TableCell>` in `Row.tsx`.
  3. Update the design doc only if the visual treatment introduces new tokens.
- A new status: extend `OrderStatus` in `lib/types.ts`, add label + variant in `constants/orderStatus.ts`. Do not branch in components.
