"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi, errorMessage } from "@/lib/admin/api-client";
import type { Paginated, Skill, SkillRef } from "@/lib/cms/types";
import { ChipsSkeleton } from "./skeletons";

/** Checkbox list of skills grouped by category. */
export function SkillPicker({ value, onChange }: { value: SkillRef[]; onChange: (value: SkillRef[]) => void }) {
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .get<Paginated<Skill>>("skills?limit=100")
      .then((res) => setSkills(res.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const s of skills ?? []) map.set(s.category.name, [...(map.get(s.category.name) ?? []), s]);
    return [...map.entries()];
  }, [skills]);

  const selected = new Set(value.map((s) => s.id));
  const toggle = (skill: Skill) =>
    onChange(
      selected.has(skill.id)
        ? value.filter((s) => s.id !== skill.id)
        : [...value, { id: skill.id, name: skill.name, slug: skill.slug }],
    );

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!skills) return <ChipsSkeleton />;
  if (!skills.length) return <p className="text-sm text-muted-foreground">No skills yet. Add them under Skills.</p>;

  return (
    <div className="grid gap-3">
      {groups.map(([category, items]) => (
        <fieldset key={category}>
          <legend className="mb-1.5 text-xs font-medium text-muted-foreground">{category}</legend>
          <div className="flex flex-wrap gap-1.5">
            {items.map((skill) => {
              const on = selected.has(skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(skill)}
                  className={
                    on
                      ? "rounded-md border border-transparent bg-primary px-2 py-1 text-xs text-primary-foreground"
                      : "rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                  }
                >
                  {skill.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
