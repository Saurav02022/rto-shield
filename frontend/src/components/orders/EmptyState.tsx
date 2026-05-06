import { PhoneCall } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
      <div className="rounded-full bg-muted p-3 text-muted-foreground">
        <PhoneCall className="size-5" aria-hidden />
      </div>
      <h3 className="text-base font-semibold">No orders yet</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Seeded sample orders will appear here on backend startup. Trigger a verification call from any
        row to see the full RTO Shield flow end-to-end.
      </p>
    </div>
  );
}
