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
import type { Credential, Paginated } from "@/lib/cms/types";

export const metadata: Metadata = { title: "Education & certifications" };

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string; kind?: string; }> };

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams({ page: String(pageParam(sp.page)), limit: "20" });
  if (sp.q) params.set("q", sp.q);
  if (sp.status) params.set("status", sp.status);
  if (sp.kind) params.set("kind", sp.kind);
  const { data, meta } = await adminFetch<Paginated<Credential>>(`/admin/credentials?${params}`);
  const filtered = !!(sp.q || sp.status || sp.kind);

  return (
    <>
      <PageHeader
        title="Education & certifications"
        description="Degrees, schools and certificates."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/education/new">New entry</Link>
          </Button>
        }
      />
      <ListToolbar q={sp.q} filters={[{ name: "status", label: "Statuses", value: sp.status, options: STATUS_FILTER_OPTIONS }, { name: "kind", label: "Types", value: sp.kind, options: [{ value: "EDUCATION", label: "Education" }, { value: "CERTIFICATION", label: "Certification" }] }]} />
      {data.length ? (
        <DataTable
          rows={data}
          columns={[
            {
              header: "Name",
              cell: (a) => (
                <Link href={`/admin/education/${a.id}`} className="font-medium hover:underline">
                  <>{a.title}<span className="block text-xs font-normal text-muted-foreground">{a.institution}</span></>
                </Link>
              ),
            },
            { header: "Type", cell: (a) => (a.kind === "EDUCATION" ? "Education" : "Certification"), hideOnMobile: true },
            { header: "Status", cell: (a) => <StatusBadge status={a.status} /> },
            { header: "Order", cell: (a) => a.sortOrder, hideOnMobile: true, className: "tabular-nums" },
            { header: "", className: "w-12 text-right", cell: (a) => <DeleteButton endpoint={`credentials/${a.id}`} itemLabel={`${a.title}`} iconOnly /> },
          ]}
        />
      ) : (
        <EmptyState
          title={filtered ? "Nothing matches these filters" : "Nothing here yet"}
          description={filtered ? "Clear the search or change the filters." : "Add schools, degrees or certifications."}
          action={filtered ? { href: "/admin/education", label: "Clear filters" } : { href: "/admin/education/new", label: "New entry" }}
        />
      )}
      <AdminPagination meta={meta} searchParams={sp} />
    </>
  );
}
