import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { AdminPagination, pageParam } from "@/components/admin/admin-pagination";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { EmptyState } from "@/components/admin/empty-state";
import { ListToolbar, STATUS_FILTER_OPTIONS } from "@/components/admin/list-toolbar";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/auth/session";
import type { Paginated, Project } from "@/lib/cms/types";

export const metadata: Metadata = { title: "Projects" };

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string }> };

export default async function ProjectsAdminPage({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams({ page: String(pageParam(sp.page)), limit: "20" });
  if (sp.q) params.set("q", sp.q);
  if (sp.status) params.set("status", sp.status);
  const { data, meta } = await adminFetch<Paginated<Project>>(`/admin/projects?${params}`);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Work shown in the Projects section and on /projects."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/projects/new">New project</Link>
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
              cell: (p) => (
                <Link href={`/admin/projects/${p.id}`} className="font-medium hover:underline">
                  {p.featured && <Star className="mr-1 inline size-3.5 fill-highlight text-highlight" aria-label="Featured" />}
                  {p.title}
                  <span className="block text-xs font-normal text-muted-foreground">/projects/{p.slug}</span>
                </Link>
              ),
            },
            { header: "Status", cell: (p) => <StatusBadge status={p.status} scheduled={!!p.publishedAt && new Date(p.publishedAt) > new Date()} /> },
            { header: "Order", cell: (p) => p.sortOrder, hideOnMobile: true, className: "tabular-nums" },
            { header: "Updated", cell: (p) => new Date(p.updatedAt).toLocaleDateString(), hideOnMobile: true },
            { header: "", className: "w-12 text-right", cell: (p) => <DeleteButton endpoint={`projects/${p.id}`} itemLabel={`“${p.title}”`} iconOnly /> },
          ]}
        />
      ) : (
        <EmptyState
          title={sp.q || sp.status ? "No projects match these filters" : "No projects yet"}
          description={sp.q || sp.status ? "Clear the search or change the status filter." : "Add your first project to show it on the site."}
          action={sp.q || sp.status ? { href: "/admin/projects", label: "Clear filters" } : { href: "/admin/projects/new", label: "New project" }}
        />
      )}
      <AdminPagination meta={meta} searchParams={sp} />
    </>
  );
}
