import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "./section";

/**
 * Loading skeletons for public routes. Each mirrors the layout of the page it
 * stands in for, so content doesn't jump when it arrives.
 */

const bar = "bg-gray-200/70 dark:bg-neutral-800";

export function HomeSkeleton() {
  return (
    <PageContainer>
      <div aria-busy="true" aria-label="Loading">
        <div className="flex items-center gap-x-3">
          <Skeleton className={`size-16 rounded-full ${bar}`} />
          <div className="grid gap-2">
            <Skeleton className={`h-5 w-40 ${bar}`} />
            <Skeleton className={`h-4 w-64 ${bar}`} />
          </div>
        </div>
        <div className="mt-8 grid gap-2">
          {[100, 96, 98, 80].map((w, i) => (
            <Skeleton key={i} className={`h-3.5 ${bar}`} style={{ width: `${w}%` }} />
          ))}
        </div>
        <Skeleton className={`mt-14 mb-5 h-5 w-24 ${bar}`} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className={`h-40 rounded-lg ${bar}`} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

export function ProjectGridSkeleton() {
  return (
    <PageContainer>
      <div aria-busy="true" aria-label="Loading">
        <Skeleton className={`h-8 w-36 ${bar}`} />
        <div className="mt-8 grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i}>
              <Skeleton className={`h-40 rounded-lg ${bar}`} />
              <Skeleton className={`mt-2 h-4 w-3/4 ${bar}`} />
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

export function ArticleListSkeleton() {
  return (
    <PageContainer>
      <div aria-busy="true" aria-label="Loading">
        <Skeleton className={`h-9 w-40 ${bar}`} />
        <Skeleton className={`mt-3 h-4 w-80 max-w-full ${bar}`} />
        <div className="mt-6 flex gap-2">
          {[56, 72, 48].map((w, i) => (
            <Skeleton key={i} className={`h-5 ${bar}`} style={{ width: w }} />
          ))}
        </div>
        <Skeleton className={`mt-12 mb-4 h-4 w-12 ${bar}`} />
        <div className="space-y-7">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="grid grid-cols-[3.75rem_1fr] gap-x-4 sm:grid-cols-[4.5rem_1fr]">
              <Skeleton className={`h-3.5 w-12 ${bar}`} />
              <div className="grid gap-2">
                <Skeleton className={`h-4 w-4/5 ${bar}`} />
                <Skeleton className={`h-3.5 w-full ${bar}`} />
                <Skeleton className={`h-3 w-32 ${bar}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

/** Reading-view skeleton for article and project detail pages. */
export function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-20 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading">
      <Skeleton className={`h-4 w-24 ${bar}`} />
      <Skeleton className={`mt-10 h-3.5 w-36 ${bar}`} />
      <Skeleton className={`mt-4 h-10 w-full ${bar}`} />
      <Skeleton className={`mt-2 h-10 w-2/3 ${bar}`} />
      <Skeleton className={`mt-6 h-5 w-full ${bar}`} />
      <Skeleton className={`mt-2 h-5 w-5/6 ${bar}`} />
      <Skeleton className={`mt-8 aspect-[16/9] w-full rounded-2xl ${bar}`} />
      <div className="mt-10 grid gap-3">
        {[100, 97, 99, 92, 60].map((w, i) => (
          <Skeleton key={i} className={`h-4 ${bar}`} style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}
