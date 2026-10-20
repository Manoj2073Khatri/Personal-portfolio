import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { getSiteNameForAdmin } from "@/lib/auth/session";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  return (
    <>
      <PageHeader title="New project" back={{ href: "/admin/projects", label: "Projects" }} />
      <ProjectForm siteName={await getSiteNameForAdmin()} />
    </>
  );
}
