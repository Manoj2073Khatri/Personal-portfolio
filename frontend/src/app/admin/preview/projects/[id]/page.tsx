import { ProjectView } from "@/components/site/project-view";
import { loadOrNotFound } from "@/lib/auth/session";
import type { Project } from "@/lib/cms/types";
import { PreviewBanner } from "../../preview-banner";

export default async function ProjectPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const project = await loadOrNotFound<Project>("projects", (await params).id);
  return (
    <ProjectView
      project={project}
      banner={<PreviewBanner status={project.status} editHref={`/admin/projects/${project.id}`} scheduledFor={project.publishedAt} />}
    />
  );
}
