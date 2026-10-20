import type { Metadata } from "next";
import Link from "next/link";
import { AdminPagination, pageParam } from "@/components/admin/admin-pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { adminFetch } from "@/lib/auth/session";
import type { ContactSubmission, Paginated } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages" };

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams({ page: String(pageParam(sp.page)), limit: "25" });
  if (sp.q) params.set("q", sp.q);
  if (sp.status) params.set("status", sp.status);
  const { data, meta } = await adminFetch<Paginated<ContactSubmission>>(`/admin/contact-submissions?${params}`);

  return (
    <>
      <PageHeader title="Messages" description="Sent through the contact form. Private: never shown on the site or in public APIs." />
      <ListToolbar
        q={sp.q}
        filters={[{ name: "status", label: "Statuses", value: sp.status, options: [{ value: "NEW", label: "New" }, { value: "READ", label: "Read" }, { value: "ARCHIVED", label: "Archived" }] }]}
      />
      {data.length ? (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {data.map((m) => (
            <li key={m.id}>
              <Link href={`/admin/messages/${m.id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40">
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-sm", m.status === "NEW" && "font-semibold")}>
                    {m.name} <span className="font-normal text-muted-foreground">&lt;{m.email}&gt;</span>
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{m.message}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={m.status} />
                  <time className="text-xs text-muted-foreground" dateTime={m.createdAt}>
                    {new Date(m.createdAt).toLocaleDateString()}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={sp.q || sp.status ? "No messages match these filters" : "No messages yet"}
          description={sp.q || sp.status ? "Clear the search or change the status filter." : "Messages from the contact form appear here."}
          action={sp.q || sp.status ? { href: "/admin/messages", label: "Clear filters" } : undefined}
        />
      )}
      <AdminPagination meta={meta} searchParams={sp} />
    </>
  );
}
