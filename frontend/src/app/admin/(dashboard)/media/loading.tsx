import { MediaGridSkeleton } from "@/components/admin/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="h-7 w-28" />
      <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      <Skeleton className="mt-6 h-9 w-48" />
      <Skeleton className="mt-4 h-28 w-full rounded-lg" />
      <div className="mt-6">
        <MediaGridSkeleton count={9} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
      </div>
    </div>
  );
}
