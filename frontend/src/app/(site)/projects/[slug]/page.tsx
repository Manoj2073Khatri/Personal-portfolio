import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { breadcrumbs, JsonLd, SITE_URL } from "@/components/site/json-ld";
import { ProjectView } from "@/components/site/project-view";
import { getProject, getSiteSettings, getSitemapData } from "@/lib/cms/public-api";
import { contentMetadata, metaDescription } from "@/lib/cms/seo";

type Props = { params: Promise<{ slug: string }> };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Published slugs are pre-rendered; new ones render on first request.
export async function generateStaticParams() {
  const { projects } = await getSitemapData();
  return projects.map(({ slug }) => ({ slug }));
}

async function load(slug: string) {
  return SLUG.test(slug) ? getProject(slug) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [project, settings] = await Promise.all([load(slug), getSiteSettings()]);
  // Throwing here (not only in the page) lets crawlers get a real 404 status.
  if (!project) notFound();
  return contentMetadata({
    settings,
    title: project.seoTitle || project.title,
    description: metaDescription(project.seoDescription, project.summary),
    path: `/projects/${project.slug}`,
    image: project.ogImage ?? project.thumbnail,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([load(slug), getSiteSettings()]);
  if (!project) notFound();
  if (project.slug !== slug) permanentRedirect(`/projects/${project.slug}`);

  const image = project.ogImage ?? project.thumbnail;
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.title,
            description: metaDescription(project.seoDescription, project.summary),
            url: `${SITE_URL}/projects/${project.slug}`,
            creator: { "@type": "Person", name: settings.name, url: SITE_URL },
            image: image ? [image.url] : undefined,
            keywords: project.skills.map((s) => s.name).join(", ") || undefined,
            sameAs: project.liveUrl || undefined,
            dateModified: project.updatedAt,
          },
          breadcrumbs(SITE_URL, [
            { name: "Home", path: "/" },
            { name: "Projects", path: "/projects" },
            { name: project.title, path: `/projects/${project.slug}` },
          ]),
        ]}
      />
      <ProjectView project={project} />
    </>
  );
}
