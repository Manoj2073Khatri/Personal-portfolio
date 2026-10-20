import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import type { PublicProject } from "@/lib/cms/types";
import { formatRange, safeHref } from "@/lib/format";
import { CmsImage } from "./cms-image";
import { Markdown } from "./markdown";

/** Project detail. Shared by the public page and the admin preview. */
export function ProjectView({ project, banner }: { project: PublicProject; banner?: React.ReactNode }) {
  const live = safeHref(project.liveUrl);
  const repo = safeHref(project.repoUrl);
  const dates = formatRange(project.startDate, project.endDate);

  return (
    <article className="mx-auto w-full max-w-2xl px-4 pt-6 pb-20 sm:px-6 lg:px-8">
      {banner}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-neutral-500 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        All projects
      </Link>

      <header className="mt-8">
        {(project.role || dates) && (
          <p className="font-mono text-xs text-gray-500 dark:text-neutral-500">
            {[project.role, dates].filter(Boolean).join(" · ")}
          </p>
        )}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl dark:text-neutral-50">
          <span className="highlight-stroke">{project.title}</span>
        </h1>
        {project.summary && (
          <p className="mt-4 text-base text-pretty text-gray-600 dark:text-neutral-400">{project.summary}</p>
        )}
        {(live || repo) && (
          <div className="mt-6 flex flex-wrap gap-2">
            {live && (
              <a
                href={live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Visit site <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            )}
            {repo && (
              <a
                href={repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <FaGithub aria-hidden="true" /> Source
              </a>
            )}
          </div>
        )}
      </header>

      {project.thumbnail && (
        <CmsImage
          media={project.thumbnail}
          alt={project.thumbnail.alt || `${project.title} screenshot`}
          priority
          className="mt-8 w-full rounded-xl bg-gray-100 object-cover ring-1 ring-gray-200 dark:bg-neutral-800 dark:ring-neutral-800"
        />
      )}

      {project.body && (
        <Markdown variant="article" className="mt-10">
          {project.body}
        </Markdown>
      )}

      {project.gallery.length > 0 && (
        <section aria-label="Gallery" className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {project.gallery.map((media) => (
            <CmsImage
              key={media.id}
              media={media}
              className="w-full rounded-lg bg-gray-100 object-cover ring-1 ring-gray-200 dark:bg-neutral-800 dark:ring-neutral-800"
            />
          ))}
        </section>
      )}

      {project.skills.length > 0 && (
        <section aria-labelledby="stack" className="mt-12">
          <h2 id="stack" className="text-sm font-medium text-gray-800 dark:text-neutral-200">
            Built with
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.skills.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/projects?skill=${encodeURIComponent(s.slug)}`}
                  className="rounded-md px-2 py-1 font-mono text-xs text-gray-600 ring-1 ring-gray-200 ring-inset hover:ring-gray-400 dark:text-neutral-400 dark:ring-neutral-700"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
