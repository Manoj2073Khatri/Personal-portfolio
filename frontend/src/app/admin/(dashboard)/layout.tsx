import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { adminFetch, requireAdmin } from "@/lib/auth/session";
import type { DashboardStats } from "@/lib/cms/types";

export const metadata: Metadata = {
  title: { default: "Dashboard — Portfolio CMS", template: "%s — Portfolio CMS" },
  robots: { index: false, follow: false },
};

// Server-side gate for every admin page; the API enforces the same check per request.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const stats = await adminFetch<DashboardStats>("/admin/stats").catch(() => null);

  return (
    <SidebarProvider>
      <AdminSidebar user={user} newMessages={stats?.newSubmissions ?? 0} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <span className="text-sm text-muted-foreground">Portfolio CMS</span>
        </header>
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
