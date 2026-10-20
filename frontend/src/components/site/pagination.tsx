import Link from "next/link";
import type { PageMeta } from "@/lib/cms/types";

function href(basePath: string, page: number, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) search.set(k, v);
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

const linkClass =
  "rounded-md px-3 py-1.5 text-sm text-gray-700 ring-1 ring-gray-200 ring-inset hover:bg-gray-50 dark:text-neutral-300 dark:ring-neutral-700 dark:hover:bg-neutral-800";

export function Pagination({
  meta,
  basePath,
  params = {},
  labels = ["← Previous", "Next →"],
}: {
  meta: PageMeta;
  basePath: string;
  params?: Record<string, string | undefined>;
  labels?: [string, string];
}) {
  if (meta.totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-between">
      {meta.page > 1 ? (
        <Link href={href(basePath, meta.page - 1, params)} className={linkClass} rel="prev">
          {labels[0]}
        </Link>
      ) : (
        <span />
      )}
      <span className="font-mono text-xs text-gray-500 dark:text-neutral-500">
        {meta.page} / {meta.totalPages}
      </span>
      {meta.page < meta.totalPages ? (
        <Link href={href(basePath, meta.page + 1, params)} className={linkClass} rel="next">
          {labels[1]}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
