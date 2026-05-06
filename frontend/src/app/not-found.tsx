import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-4 px-4 pt-24 text-center">
      <p className="font-mono text-xs uppercase text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Order not found</h1>
      <p className="text-sm text-muted-foreground">
        The order you&apos;re looking for might have been removed or never existed.
      </p>
      <Button asChild size="sm" className="mt-2">
        <Link href="/">Back to dashboard</Link>
      </Button>
    </main>
  );
}
