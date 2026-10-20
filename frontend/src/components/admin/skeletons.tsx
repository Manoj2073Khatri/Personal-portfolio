import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeletons for admin screens, shaped like the content they replace. */

function HeaderSkeleton({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-3">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72 max-w-[60vw]" />
      </div>
      {withAction && <Skeleton className="h-8 w-28" />}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      <HeaderSkeleton />
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="overflow-hidden rounded-xl border">
        <Skeleton className="h-9 w-full rounded-none" />
        <div className="divide-y">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="grid flex-1 gap-1.5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-5 w-20" />
              <Skeleton className="hidden h-4 w-16 md:block" />
              <Skeleton className="size-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton({ sections = 3 }: { sections?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="mb-2 h-4 w-20" />
      <HeaderSkeleton withAction={false} />
      <div className="grid gap-6">
        {Array.from({ length: sections }, (_, s) => (
          <div key={s} className="grid gap-4 rounded-xl border p-4 sm:p-6">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 3 }, (_, f) => (
              <div key={f} className="grid gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className={f === 2 ? "h-24 w-full" : "h-9 w-full"} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <HeaderSkeleton />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="grid gap-2 rounded-xl border p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}

export function MediaGridSkeleton({ count = 12, className = "grid-cols-3 sm:grid-cols-6" }: { count?: number; className?: string }) {
  return (
    <ul className={`grid gap-2 ${className}`} aria-busy="true" aria-label="Loading media">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="mt-1 h-3 w-3/4" />
        </li>
      ))}
    </ul>
  );
}

export function ChipsSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading">
      {[5, 7, 4].map((n, g) => (
        <div key={g} className="grid gap-1.5">
          <Skeleton className="h-3 w-24" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: n }, (_, i) => (
              <Skeleton key={i} className="h-6" style={{ width: 48 + ((i * 17) % 40) }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
