import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-2 rounded-xl border bg-card p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="ml-auto h-7 w-20" />
          </div>
        ))}
      </div>
    </main>
  );
}
