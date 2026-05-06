import { NextResponse } from "next/server";

// Lightweight liveness probe used by container smoke tests and Cloud Run.
// Intentionally has zero external dependencies (no backend, no DB) so it
// reflects only whether the Next.js server is up.

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok" });
}
