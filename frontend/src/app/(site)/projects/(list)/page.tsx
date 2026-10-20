import type { Metadata } from "next";
import Link from "next/link";
import { ProjectGrid } from "@/components/site/project-grid";
import { PageContainer } from "@/components/site/section";
import { Pagination } from "@/components/site/pagination";
import { getProjects, getSiteSettings } from "@/lib/cms/public-api";
import { contentMetadata } from "@/lib/cms/seo";

type Props = { searchParams: Promise<{ page?: string; skill?: string }> };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return contentMetadata({
    settings,
    title: "Projects",
    description: `Projects by ${settings.name}.`,
    path: "/projects",
  });
}

export default async function ProjectsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const skill = params.skill && SLUG.test(params.skill) ? params.skill : undefined;
  const { data, meta } = await getProjects(page, skill);

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">Projects</h1>
      {skill && (
        <p className="mt-2 text-sm text-gray-500 dark:text-neutral-500">
          Built with <span className="font-mono">{skill}</span> ·{" "}
          <Link href="/projects" className="underline hover:text-gray-800 dark:hover:text-neutral-300">
            Show all
          </Link>
        </p>
      )}
      <div className="mt-8">
        {data.length ? (
          <ProjectGrid projects={data} />
        ) : (
          <p className="text-sm text-gray-500 dark:text-neutral-500">No projects to show yet.</p>
        )}
      </div>
      <Pagination meta={meta} basePath="/projects" params={{ skill }} />
    </PageContainer>
  );
}
