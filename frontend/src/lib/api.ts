/**
 * Server-side fetcher for the FastAPI backend.
 *
 * Used by:
 * - `app/api/*` route handlers (proxy mutations from the client)
 * - `lib/orders-server.ts` (initial data fetch in Server Components)
 *
 * Never imported from a `'use client'` file — keeps `BACKEND_API_URL` off the
 * client bundle and keeps a single place to evolve auth headers, retries, or
 * tracing in the future.
 */

import { env } from "@/config/env";

export type BackendErrorBody = {
  code?: string;
  message?: string;
  detail?: string;
};

export class BackendError extends Error {
  readonly status: number;
  readonly code: string;

  constructor({ status, code, message }: { status: number; code: string; message: string }) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "BackendError";
  }
}

type FetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  searchParams?: Record<string, string | undefined>;
  /** Forwarded to `fetch` so callers can opt into Next.js cache or revalidation. */
  next?: RequestInit["next"];
  cache?: RequestInit["cache"];
};

export async function backendFetch<TResult>(
  path: string,
  options: FetchOptions = {},
): Promise<TResult> {
  const url = new URL(path, env.BACKEND_API_URL);
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? "no-store",
    next: options.next,
  });

  if (!response.ok) {
    let parsed: BackendErrorBody | null = null;
    try {
      parsed = (await response.json()) as BackendErrorBody;
    } catch {
      parsed = null;
    }
    throw new BackendError({
      status: response.status,
      code: parsed?.code ?? `HTTP_${response.status}`,
      message: parsed?.message ?? parsed?.detail ?? response.statusText,
    });
  }

  // 204 No Content
  if (response.status === 204) return undefined as TResult;

  return (await response.json()) as TResult;
}
