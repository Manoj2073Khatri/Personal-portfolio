import type { Metadata } from "next";
import Link from "next/link";
import { AdminPagination, pageParam } from "@/components/admin/admin-pagination";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { EmptyState } from "@/components/admin/empty-state";
import { ListToolbar, STATUS_FILTER_OPTIONS } from "@/components/admin/list-toolbar";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/auth/session";
import type { Testimonial, Paginated } from "@/lib/cms/types";

export const metadata: Metadata = { title: "Testimonials" };

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string; }> };

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams({ page: String(pageParam(sp.page)), limit: "20" });
  if (sp.q) params.set("q", sp.q);
  if (sp.status) params.set("status", sp.status);
  const { data, meta } = await adminFetch<Paginated<Testimonial>>(`/admin/testimonials?${params}`);
  const filtered = !!(sp.q || sp.status);

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Quotes from clients and colleagues. Only publish ones you have permission to share."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/testimonials/new">New testimonial</Link>
          </Button>
        }
      />
      <ListToolbar q={sp.q} filters={[{ name: "status", label: "Statuses", value: sp.status, options: STATUS_FILTER_OPTIONS }]} />
      {data.length ? (
        <DataTable
          rows={data}
          columns={[
            {
              header: "Name",
              cell: (a) => (
                <Link href={`/admin/testimonials/${a.id}`} className="font-medium hover:underline">
                  <>{a.authorName}<span className="block max-w-md truncate text-xs font-normal text-muted-foreground">“{a.quote}”</span></>
                </Link>
              ),
            },

            { header: "Status", cell: (a) => <StatusBadge status={a.status} /> },
            { header: "Order", cell: (a) => a.sortOrder, hideOnMobile: true, className: "tabular-nums" },
            { header: "", className: "w-12 text-right", cell: (a) => <DeleteButton endpoint={`testimonials/${a.id}`} itemLabel={`testimonial from ${a.authorName}`} iconOnly /> },
          ]}
        />
      ) : (
        <EmptyState
          title={filtered ? "Nothing matches these filters" : "Nothing here yet"}
          description={filtered ? "Clear the search or change the filters." : "Add a quote from someone you have worked with."}
          action={filtered ? { href: "/admin/testimonials", label: "Clear filters" } : { href: "/admin/testimonials/new", label: "New testimonial" }}
        />
      )}
      <AdminPagination meta={meta} searchParams={sp} />
    </>
  );
}
