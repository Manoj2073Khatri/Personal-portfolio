import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PageMeta } from "@/lib/cms/types";

export function AdminPagination({
  meta,
  searchParams,
}: {
  meta: PageMeta;
  searchParams: Record<string, string | undefined>;
}) {
  if (meta.totalPages <= 1) {
    return <p className="mt-3 text-xs text-muted-foreground">{meta.total} item{meta.total === 1 ? "" : "s"}</p>;
  }
  const href = (page: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (v && k !== "page") params.set(k, v);
    params.set("page", String(page));
    return `?${params.toString()}`;
  };
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-2">
      <p className="text-xs text-muted-foreground">
        Page {meta.page} of {meta.totalPages} · {meta.total} items
      </p>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" aria-disabled={meta.page <= 1} className={meta.page <= 1 ? "pointer-events-none opacity-50" : ""}>
          <Link href={href(meta.page - 1)}>Previous</Link>
        </Button>
        <Button asChild variant="outline" size="sm" aria-disabled={meta.page >= meta.totalPages} className={meta.page >= meta.totalPages ? "pointer-events-none opacity-50" : ""}>
          <Link href={href(meta.page + 1)}>Next</Link>
        </Button>
      </div>
    </nav>
  );
}

/** Parses ?page= safely for admin list pages. */
export function pageParam(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}
