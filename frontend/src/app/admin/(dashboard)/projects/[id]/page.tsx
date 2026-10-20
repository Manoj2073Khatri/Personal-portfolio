import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { getSiteNameForAdmin, loadOrNotFound } from "@/lib/auth/session";
import type { Project } from "@/lib/cms/types";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const [project, siteName] = await Promise.all([
    loadOrNotFound<Project>("projects", (await params).id),
    getSiteNameForAdmin(),
  ]);
  return (
    <>
      <PageHeader
        title={project.title}
        back={{ href: "/admin/projects", label: "Projects" }}
        actions={<DeleteButton endpoint={`projects/${project.id}`} itemLabel={`“${project.title}”`} redirectTo="/admin/projects" />}
      />
      <ProjectForm project={project} siteName={siteName} />
    </>
  );
}
