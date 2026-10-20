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
import type { Experience, Paginated } from "@/lib/cms/types";

export const metadata: Metadata = { title: "Experience" };

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string; }> };

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams({ page: String(pageParam(sp.page)), limit: "20" });
  if (sp.q) params.set("q", sp.q);
  if (sp.status) params.set("status", sp.status);
  const { data, meta } = await adminFetch<Paginated<Experience>>(`/admin/experiences?${params}`);
  const filtered = !!(sp.q || sp.status);

  return (
    <>
      <PageHeader
        title="Experience"
        description="Work history shown in the experience timeline."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/experience/new">New role</Link>
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
                <Link href={`/admin/experience/${a.id}`} className="font-medium hover:underline">
                  <>{a.role}<span className="block text-xs font-normal text-muted-foreground">{a.company}</span></>
                </Link>
              ),
            },
            { header: "Dates", cell: (a) => `${new Date(a.startDate).getFullYear()} – ${a.isCurrent ? "Present" : a.endDate ? new Date(a.endDate).getFullYear() : ""}`, hideOnMobile: true },
            { header: "Status", cell: (a) => <StatusBadge status={a.status} /> },
            { header: "Order", cell: (a) => a.sortOrder, hideOnMobile: true, className: "tabular-nums" },
            { header: "", className: "w-12 text-right", cell: (a) => <DeleteButton endpoint={`experiences/${a.id}`} itemLabel={`${a.role} at ${a.company}`} iconOnly /> },
          ]}
        />
      ) : (
        <EmptyState
          title={filtered ? "Nothing matches these filters" : "Nothing here yet"}
          description={filtered ? "Clear the search or change the filters." : "Add the roles you want to show on your portfolio."}
          action={filtered ? { href: "/admin/experience", label: "Clear filters" } : { href: "/admin/experience/new", label: "New role" }}
        />
      )}
      <AdminPagination meta={meta} searchParams={sp} />
    </>
  );
}
