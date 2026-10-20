import type { Metadata } from "next";
import { ListToolbar, STATUS_FILTER_OPTIONS } from "@/components/admin/list-toolbar";
import { PageHeader } from "@/components/admin/page-header";
import { adminFetch } from "@/lib/auth/session";
import type { Paginated, Skill, SkillCategory } from "@/lib/cms/types";
import { SkillsManager } from "./skills-manager";

export const metadata: Metadata = { title: "Skills" };

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function SkillsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams({ limit: "100" });
  if (sp.q) params.set("q", sp.q);
  if (sp.status) params.set("status", sp.status);
  const [categories, skills] = await Promise.all([
    adminFetch<SkillCategory[]>("/admin/skill-categories"),
    adminFetch<Paginated<Skill>>(`/admin/skills?${params}`),
  ]);

  return (
    <>
      <PageHeader title="Skills" description="Grouped by category on the homepage. Only published skills in non-empty categories appear." />
      <ListToolbar q={sp.q} filters={[{ name: "status", label: "Statuses", value: sp.status, options: STATUS_FILTER_OPTIONS }]} />
      <SkillsManager categories={categories} skills={skills.data} q={sp.q} />
    </>
  );
}
