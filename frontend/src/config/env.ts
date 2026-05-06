/**
 * Centralised env access. Server-only secrets stay off the client bundle by
 * never exporting `process.env.*` from a `'use client'` file.
 *
 * Prod/staging backends are always supplied via `BACKEND_API_URL` / Cloud Run —
 * localhost below is purely a DX fallback for `next dev`.
 */

const fallbackBackend = "http://localhost:8000";

export const env = {
  /** Resolved at request time on the server. Used by `lib/api.ts`. */
  BACKEND_API_URL: process.env.BACKEND_API_URL ?? fallbackBackend,
  /** Public mirror — only used when a client component needs to know the public origin (rarely). */
  NEXT_PUBLIC_BACKEND_API_URL:
    process.env.NEXT_PUBLIC_BACKEND_API_URL ?? fallbackBackend,
} as const;
