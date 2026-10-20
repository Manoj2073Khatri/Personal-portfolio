import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicProject } from "@/lib/cms/types";
import { CmsImage } from "./cms-image";

type CardProject = Pick<PublicProject, "slug" | "title" | "summary" | "thumbnail">;

export function ProjectCard({ project }: { project: CardProject }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-800">
        <CmsImage
          media={project.thumbnail}
          alt={project.thumbnail?.alt || project.title}
          className="h-40 w-full object-cover object-top transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          fallback={
            <div className="flex h-40 items-center justify-center p-4 text-center text-sm font-medium text-gray-500 dark:text-neutral-400">
              {project.title}
            </div>
          }
        />
        <div className="absolute end-1 bottom-1 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex items-center gap-x-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
            View <ArrowUpRight className="size-3" aria-hidden="true" />
          </span>
        </div>
      </div>
      <p className="mt-2 truncate text-sm font-medium text-gray-800 dark:text-neutral-200">{project.title}</p>
      {project.summary && (
        <p className="line-clamp-2 text-xs text-gray-500 dark:text-neutral-500">{project.summary}</p>
      )}
    </Link>
  );
}

export function ProjectGrid({ projects }: { projects: CardProject[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  );
}
