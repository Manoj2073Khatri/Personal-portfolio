import type { EmploymentType, Experience } from "@/lib/cms/types";
import { formatRange, safeHref } from "@/lib/format";
import { CmsImage, Initials } from "./cms-image";

const EMPLOYMENT_LABEL: Partial<Record<EmploymentType, string>> = {
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
};

type Item = Omit<Experience, "status">;

export function ExperienceTimeline({ items }: { items: Item[] }) {
  return (
    <ol>
      {items.map((item) => {
        const companyHref = safeHref(item.companyUrl);
        const meta = [EMPLOYMENT_LABEL[item.employmentType], item.location].filter(Boolean).join(" · ");
        return (
          <li key={item.id} className="group relative flex gap-x-5">
            <div className="relative after:absolute after:start-3 after:top-8 after:bottom-2 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 group-last:after:hidden dark:after:bg-neutral-700">
              <div className="relative z-10 flex size-6 items-center justify-center">
                <CmsImage
                  media={item.logo}
                  alt={`${item.company} logo`}
                  width={24}
                  height={24}
                  className="size-6 rounded object-contain"
                  fallback={<Initials name={item.company} className="size-6 rounded text-[9px]" />}
                />
              </div>
            </div>

            <div className="grow pb-8 group-last:pb-0">
              <p className="mb-1 text-xs text-gray-600 dark:text-neutral-400">
                {formatRange(item.startDate, item.endDate, { current: item.isCurrent })}
                {meta && <span className="text-gray-400 dark:text-neutral-500"> · {meta}</span>}
              </p>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
                {item.role} at{" "}
                {companyHref ? (
                  <a href={companyHref} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">
                    {item.company}
                  </a>
                ) : (
                  <b>{item.company}</b>
                )}
              </h3>
              {item.summary && <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">{item.summary}</p>}
              {item.responsibilities.length > 0 && (
                <ul className="mt-1 list-none space-y-0.5 text-sm text-gray-600 dark:text-neutral-400">
                  {item.responsibilities.map((r) => (
                    <li key={r}>- {r}</li>
                  ))}
                </ul>
              )}
              {item.achievements.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-sm text-gray-700 dark:text-neutral-300">
                  {item.achievements.map((a) => (
                    <li key={a}>★ {a}</li>
                  ))}
                </ul>
              )}
              {item.skills.length > 0 && (
                <p className="mt-2 font-mono text-[11px] text-gray-500 dark:text-neutral-500">
                  {item.skills.map((s) => s.name).join(" · ")}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
