import type { Metadata } from "next";
import Link from "next/link";
import { AdminPagination, pageParam } from "@/components/admin/admin-pagination";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { PageHeader } from "@/components/admin/page-header";
import { adminFetch } from "@/lib/auth/session";
import type { Media, Paginated } from "@/lib/cms/types";
import { cn } from "@/lib/utils";
import { MediaLibrary } from "./media-library";

export const metadata: Metadata = { title: "Media" };

type Props = { searchParams: Promise<{ q?: string; kind?: string; status?: string; page?: string }> };

export default async function MediaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const kind = sp.kind === "DOCUMENT" ? "DOCUMENT" : "IMAGE";
  const params = new URLSearchParams({ kind, page: String(pageParam(sp.page)), limit: "24" });
  if (sp.q) params.set("q", sp.q);
  if (sp.status) params.set("status", sp.status);
  const { data, meta } = await adminFetch<Paginated<Media>>(`/admin/media?${params}`);

  const tab = (k: "IMAGE" | "DOCUMENT", label: string) => (
    <Link
      href={`/admin/media?kind=${k}`}
      aria-current={kind === k ? "page" : undefined}
      className={cn("rounded-md px-3 py-1.5 text-sm", kind === k ? "bg-background font-medium shadow-xs" : "text-muted-foreground hover:text-foreground")}
    >
      {label}
    </Link>
  );

  return (
    <>
      <PageHeader title="Media" description="Images and documents used across the site. Files in use can’t be deleted." />
      <nav aria-label="Media type" className="mb-4 inline-flex gap-1 rounded-lg bg-muted p-1">
        {tab("IMAGE", "Images")}
        {tab("DOCUMENT", "Documents")}
      </nav>
      <ListToolbar
        q={sp.q}
        hidden={{ kind }}
        filters={[{ name: "status", label: "Statuses", value: sp.status, options: [{ value: "READY", label: "Ready" }, { value: "PENDING", label: "Pending upload" }] }]}
      />
      <MediaLibrary items={data} kind={kind} />
      <AdminPagination meta={meta} searchParams={{ ...sp, kind }} />
    </>
  );
}
