import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/auth/session";
import type { DashboardStats } from "@/lib/cms/types";

const CARDS = [
  { key: "projects", label: "Projects", href: "/admin/projects" },
  { key: "articles", label: "Articles", href: "/admin/articles" },
  { key: "skills", label: "Skills", href: "/admin/skills" },
  { key: "experiences", label: "Experience", href: "/admin/experience" },
  { key: "credentials", label: "Education & certs", href: "/admin/education" },
  { key: "testimonials", label: "Testimonials", href: "/admin/testimonials" },
] as const;

export default async function DashboardPage() {
  const stats = await adminFetch<DashboardStats>("/admin/stats");

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="What’s live on your portfolio and what still needs work."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/articles/new">New article</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/projects/new">New project</Link>
            </Button>
          </>
        }
      />

      {stats.newSubmissions > 0 && (
        <Link href="/admin/messages?status=NEW" className="mb-6 block rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40">
          <strong>{stats.newSubmissions}</strong> new message{stats.newSubmissions === 1 ? "" : "s"} from the contact form →
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {CARDS.map(({ key, label, href }) => {
          const c = stats[key];
          return (
            <Link key={key} href={href} className="rounded-xl border bg-card p-4 transition hover:border-foreground/20">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{c.PUBLISHED}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                published · {c.DRAFT} draft{c.DRAFT === 1 ? "" : "s"}
                {c.ARCHIVED ? ` · ${c.ARCHIVED} archived` : ""}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-xl border bg-card">
          <h2 className="border-b px-4 py-3 text-sm font-medium">Recently updated</h2>
          {stats.recentlyUpdated.length ? (
            <ul className="divide-y">
              {stats.recentlyUpdated.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <Link href={`/admin/${item.type}s/${item.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {item.type} · {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                    </span>
                    <StatusBadge status={item.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-sm text-muted-foreground">Nothing yet.</p>
          )}
        </section>
        <section className="rounded-xl border bg-card p-4">
          <h2 className="text-sm font-medium">Library</h2>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{stats.media}</p>
          <p className="text-xs text-muted-foreground">media files</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/admin/media">Open media library</Link>
          </Button>
        </section>
      </div>
    </>
  );
}
