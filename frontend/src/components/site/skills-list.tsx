import type { PublicSkillGroup } from "@/lib/cms/types";

export function SkillsList({ groups }: { groups: PublicSkillGroup[] }) {
  return (
    <div className="space-y-3">
      {groups.map(({ category, skills }) => (
        <dl key={category.id} className="flex flex-col gap-1 sm:flex-row">
          <dt className="min-w-40">
            <span className="block text-sm text-gray-500 dark:text-neutral-500">{category.name}:</span>
          </dt>
          <dd>
            <ul className="text-sm text-gray-800 dark:text-neutral-200">
              {skills.map((skill, i) => (
                <li key={skill.id} className="inline">
                  {skill.name}
                  {skill.proficiency && (
                    <span className="text-gray-500 dark:text-neutral-500"> ({skill.proficiency})</span>
                  )}
                  {i < skills.length - 1 && <span aria-hidden="true" className="text-gray-400"> · </span>}
                </li>
              ))}
            </ul>
          </dd>
        </dl>
      ))}
    </div>
  );
}
