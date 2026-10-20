import type { Metadata } from "next";
import Link from "next/link";
import { EyeOff } from "lucide-react";
import { AdminPagination, pageParam } from "@/components/admin/admin-pagination";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { EmptyState } from "@/components/admin/empty-state";
import { ListToolbar, STATUS_FILTER_OPTIONS } from "@/components/admin/list-toolbar";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/auth/session";
import type { Article, Paginated } from "@/lib/cms/types";

export const metadata: Metadata = { title: "Articles" };

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string }> };

export default async function ArticlesAdminPage({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams({ page: String(pageParam(sp.page)), limit: "20" });
  if (sp.q) params.set("q", sp.q);
  if (sp.status) params.set("status", sp.status);
  const { data, meta } = await adminFetch<Paginated<Article>>(`/admin/articles?${params}`);
  const filtered = !!(sp.q || sp.status);

  return (
    <>
      <PageHeader
        title="Articles"
        description="Writing published at /articles. Drafts are only visible here and in preview."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/articles/new">New article</Link>
          </Button>
        }
      />
      <ListToolbar q={sp.q} filters={[{ name: "status", label: "Statuses", value: sp.status, options: STATUS_FILTER_OPTIONS }]} />
      {data.length ? (
        <DataTable
          rows={data}
          columns={[
            {
              header: "Title",
              cell: (a) => (
                <Link href={`/admin/articles/${a.id}`} className="font-medium hover:underline">
                  {a.title}
                  {a.noIndex && <EyeOff className="ml-1.5 inline size-3.5 text-muted-foreground" aria-label="Hidden from search engines" />}
                  <span className="block text-xs font-normal text-muted-foreground">
                    {a.tags.length ? a.tags.map((t) => `#${t}`).join(" ") : `/articles/${a.slug}`}
                  </span>
                </Link>
              ),
            },
            {
              header: "Status",
              cell: (a) => <StatusBadge status={a.status} scheduled={!!a.publishedAt && new Date(a.publishedAt) > new Date()} />,
            },
            { header: "Published", cell: (a) => (a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : "—"), hideOnMobile: true },
            { header: "Updated", cell: (a) => new Date(a.updatedAt).toLocaleDateString(), hideOnMobile: true },
            { header: "", className: "w-12 text-right", cell: (a) => <DeleteButton endpoint={`articles/${a.id}`} itemLabel={`“${a.title}”`} iconOnly /> },
          ]}
        />
      ) : (
        <EmptyState
          title={filtered ? "No articles match these filters" : "No articles yet"}
          description={filtered ? "Clear the search or change the status filter." : "Write your first article. It stays a draft until you publish it."}
          action={filtered ? { href: "/admin/articles", label: "Clear filters" } : { href: "/admin/articles/new", label: "New article" }}
        />
      )}
      <AdminPagination meta={meta} searchParams={sp} />
    </>
  );
}
