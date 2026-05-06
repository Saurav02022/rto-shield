# Design

## Purpose

This document is the visual source of truth for the RTO Shield admin dashboard. Use it before any UI work to keep the look and feel consistent across routes. UI changes that diverge must update this file in the same change.

## Design Intent

- An ops dashboard, not a marketing surface. Density and clarity over decoration.
- Every row is an actionable order; the user is mid-shift, glancing fast.
- Hindi/English mixed content is first-class — never break long phrases or transliterations.
- Voice AI is a backstage tool. The UI shows outcomes, not call internals, unless the user explicitly drills into the transcript.

## Visual Tone

Clean neutral surfaces with high-contrast text. Minimal chrome — borders and spacing carry the structure, not gradients or shadows. Inspired by Linear and Vercel admin: serious, professional, fast-feeling.

## Color System

The repo is on shadcn `radix-nova` style with `neutral` base. Tailwind theme tokens drive everything; do not hardcode hex.

| Role | Token | Use |
| --- | --- | --- |
| Background | `bg-background` | Page canvas |
| Surface | `bg-card` | Card / modal |
| Border | `border-border` | All separators |
| Text primary | `text-foreground` | Headings, table values |
| Text muted | `text-muted-foreground` | Secondary metadata |
| Action | `bg-primary text-primary-foreground` | Primary CTAs (Verify) |
| Destructive | `bg-destructive/10 text-destructive` | Cancel, failure states |
| Accent | `bg-accent text-accent-foreground` | Hover, selection |

**Status colors** (mapped via `Badge` variants in `constants/orderStatus.ts`):

| Status | Variant |
| --- | --- |
| `pending_verification` | secondary (neutral) |
| `verifying` | default (primary blue) |
| `ship_approved` | success (green) |
| `address_correction_requested` | warning (amber) |
| `reschedule_requested` | warning (amber) |
| `cancelled` | destructive (red) |
| `needs_followup` | warning (amber) |
| `unreachable` | secondary (muted) |
| `verification_failed` | destructive (red) |

If shadcn ships only `default | secondary | destructive | outline`, extend `Badge` once with `success` and `warning` rather than re-styling each call site.

## Typography

- Sans: `Geist Sans` (`var(--font-geist-sans)`) — body, headings
- Mono: `Geist Mono` (`var(--font-geist-mono)`) — phone numbers, order IDs, call IDs, dates

Scale:
- Page title: `text-2xl font-semibold tracking-tight`
- Section title: `text-lg font-semibold`
- Table cell: `text-sm`
- Metadata: `text-xs text-muted-foreground`

## Spacing and Layout

- Page max width: `max-w-7xl mx-auto`
- Page horizontal padding: `px-4 sm:px-6 lg:px-8`
- Page vertical rhythm: top `pt-8`, between sections `space-y-6`
- Card internal padding: `p-6`
- Table row vertical padding: `py-3`

Use Tailwind spacing only; do not introduce arbitrary px values for layout.

## Surfaces, Borders, Radius, and Shadows

- Cards: `rounded-xl border bg-card`
- Inputs / dialogs: shadcn defaults (`rounded-lg`)
- Shadows: only on `Dialog` overlays. The dashboard itself stays flat.
- Dividers: 1px `border-border`. Never two adjacent dividers.

## Navigation

The app is single-screen for the demo: orders dashboard at `/`. Order detail opens in a modal by default, and is also reachable as a standalone page at `/orders/[id]` for sharing.

- Header: brand + small refresh-all action; no global nav.
- Breadcrumbs: only on `/orders/[id]` (Orders › ORD-xxxx).

## Section Design

Each route is composed top-down:
1. Page header: title + actions (right-aligned)
2. Toolbar: filters / search / status chips
3. Primary surface: table or detail block
4. Footer: only when paginated; absent today

## Buttons and Links

- Primary actions (Verify, Refresh): shadcn `Button variant="default" size="sm"`
- Destructive actions: `variant="destructive" size="sm"`
- Secondary actions inside rows (View): `variant="ghost" size="sm"`
- Links to external resources (recording, transcript): underlined `text-primary`

Place primary CTA at the right end of a row or at the top-right of a card. Never duplicate primary CTAs in the same surface.

## Cards and Lists

The dashboard is a single table — not a card grid. Each order is one row. Cards are reserved for the detail view (`/orders/[id]`) where each captured field gets a small key/value card.

Row anatomy (left to right):
1. Order ID (mono, fixed width)
2. Customer name (truncate)
3. Product summary (truncate)
4. Order value (right-aligned, mono)
5. Status badge
6. Actions (Verify | View)

## Forms

The demo has one form: order create (used to seed via API). Modals stack a single column with `gap-4` between fields. Labels above inputs. Required fields are marked with `*`. Validation messages appear inline below the field, in `text-destructive`.

## Tables and Data Display

- Use shadcn `Table` primitive.
- Headings sticky on scroll.
- Empty cells render a single em-dash (`—`) in `text-muted-foreground`, never blank.
- Numeric columns right-aligned and mono.
- Long text columns truncate with `truncate` and full text in `title` attr.

## Media and Imagery

- Recording links open in a new tab with an external-link icon. No inline audio player in v1.
- Transcripts render as a scrollable `<pre>` with `whitespace-pre-wrap font-mono text-sm` inside the modal.

## Responsive Design

- Breakpoint: `md` (768px).
- Below `md`: table collapses into a stacked list — order ID + customer on top line, product + value on second, status + actions on third.
- Modals go full-screen below `sm` (`max-w-screen-sm md:max-w-2xl`).

## Accessibility

- All interactive elements must be reachable by keyboard with visible focus rings (shadcn default).
- Status colors must always be paired with a textual label — never color alone.
- Modal dialogs must trap focus (radix-ui handles this) and close on Escape.
- Recording / transcript links must include `aria-label` like "View transcript for order ORD-1001".

## Motion and Interaction

- Hover transitions: 120ms `transition-colors`.
- Dialog open/close: shadcn defaults (no override).
- Verify button shows a small spinner when the mutation is in flight; disabled until response.
- After successful verify, the row's status flips with a subtle `transition-colors`; no celebratory animations.

## Loading, Error, and Empty States

- Loading first paint: skeleton rows in the table (`Skeleton` primitive).
- Loading mutations: button spinner + button disabled.
- Error: toast via `sonner`. Inline error block only when the entire page failed to load.
- Empty: friendly title + one-line hint, never a sad emoji.

## Do / Don't

**Do**

- Reuse `Badge` variants from `constants/orderStatus.ts`.
- Keep order IDs and phone numbers in mono so they line up.
- Truncate long text; expose full value in tooltip / detail view.
- Use the `Verify` action as the primary CTA per row; everything else is secondary.

**Don't**

- Don't add gradients, glows, or decorative shadows.
- Don't introduce a third color besides primary/destructive without updating this file.
- Don't render call IDs or transcripts inline in the list view — they belong in the detail modal.
- Don't use `window.alert`; always use toast.
- Don't hardcode hex colors; always go through Tailwind tokens.

## Direction to Preserve

Density, neutral palette, and "ops console" feel. Anything that nudges the dashboard toward marketing aesthetics should be rejected even if it looks pretty. The product brand is calmness under operational load.
