"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Briefcase,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquareQuote,
  Settings,
  Wrench,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { logoutAction } from "@/lib/auth/actions";
import type { AuthUser } from "@/lib/cms/types";

const CONTENT = [
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/articles", label: "Articles", icon: BookOpen },
  { href: "/admin/skills", label: "Skills", icon: Wrench },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
];

const SITE = [
  { href: "/admin/media", label: "Media", icon: Images },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ user, newMessages }: { user: AuthUser; newMessages: number }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  const renderItems = (items: typeof CONTENT) =>
    items.map(({ href, label, icon: Icon }) => (
      <SidebarMenuItem key={href}>
        <SidebarMenuButton asChild isActive={active(href)} tooltip={label}>
          <Link href={href}>
            <Icon />
            <span>{label}</span>
          </Link>
        </SidebarMenuButton>
        {href === "/admin/messages" && newMessages > 0 && <SidebarMenuBadge>{newMessages}</SidebarMenuBadge>}
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="Dashboard" isActive={active("/admin")}>
              <Link href="/admin">
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-highlight text-black">
                  <LayoutDashboard className="size-4" />
                </span>
                <span className="grid text-left text-sm leading-tight">
                  <span className="font-semibold">Portfolio CMS</span>
                  <span className="text-xs text-muted-foreground">Dashboard</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarMenu>{renderItems(CONTENT)}</SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Site</SidebarGroupLabel>
          <SidebarMenu>
            {renderItems(SITE)}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="View site">
                <a href="/" target="_blank" rel="noopener">
                  <ExternalLink />
                  <span>View site</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="truncate px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden" title={user.email}>
          {user.name ? `${user.name} · ` : ""}
          {user.email}
        </div>
        <form action={logoutAction}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton type="submit" tooltip="Sign out">
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </form>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
