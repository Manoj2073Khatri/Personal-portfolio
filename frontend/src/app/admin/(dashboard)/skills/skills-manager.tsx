"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { Field } from "@/components/admin/form-fields";
import { MediaPicker } from "@/components/admin/media-picker";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { adminApi, errorMessage } from "@/lib/admin/api-client";
import { nullIfEmpty } from "@/lib/admin/use-entity-form";
import { CmsApiError } from "@/lib/cms/errors";
import type { ContentStatus, MediaRef, Skill, SkillCategory } from "@/lib/cms/types";

type SkillDraft = {
  id?: string;
  name: string;
  categoryId: string;
  proficiency: string;
  icon: MediaRef | null;
  sortOrder: number;
  status: ContentStatus;
};

type CategoryDraft = { id?: string; name: string; sortOrder: number };

function useSaver() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const run = async (fn: () => Promise<unknown>) => {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      await fn();
      router.refresh();
      return true;
    } catch (e) {
      if (e instanceof CmsApiError) setFieldErrors(e.fieldErrors);
      setError(errorMessage(e));
      return false;
    } finally {
      setSaving(false);
    }
  };
  const reset = () => { setError(null); setFieldErrors({}); };
  return { run, saving, error, fieldErrors, reset };
}

function CategoryDialog({ draft, onClose }: { draft: CategoryDraft | null; onClose: () => void }) {
  const [value, setValue] = useState<CategoryDraft | null>(draft);
  const saver = useSaver();
  if (!value) return null;

  const save = () =>
    saver
      .run(() =>
        value.id
          ? adminApi.patch(`skill-categories/${value.id}`, { name: value.name, sortOrder: value.sortOrder })
          : adminApi.post("skill-categories", { name: value.name, sortOrder: value.sortOrder }),
      )
      .then((ok) => ok && close());
  const close = () => { setValue(null); saver.reset(); onClose(); };

  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{value.id ? "Edit category" : "New category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="grid gap-4">
          <Field label="Name" required error={saver.fieldErrors.name?.[0]}>
            {(p) => <Input {...p} value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} maxLength={60} required autoFocus />}
          </Field>
          <Field label="Display order" error={saver.fieldErrors.sortOrder?.[0]}>
            {(p) => <Input {...p} type="number" value={value.sortOrder} onChange={(e) => setValue({ ...value, sortOrder: Number(e.target.value) })} />}
          </Field>
          {saver.error && <p role="alert" className="text-sm text-destructive">{saver.error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            <Button type="submit" disabled={saver.saving}>{saver.saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SkillDialog({ draft, categories, onClose }: { draft: SkillDraft | null; categories: SkillCategory[]; onClose: () => void }) {
  const [value, setValue] = useState<SkillDraft | null>(draft);
  const saver = useSaver();
  if (!value) return null;

  const payload = () => ({
    name: value.name.trim(),
    categoryId: value.categoryId,
    proficiency: nullIfEmpty(value.proficiency),
    iconId: value.icon?.id ?? null,
    sortOrder: Number(value.sortOrder) || 0,
    status: value.status,
  });
  const close = () => { setValue(null); saver.reset(); onClose(); };
  const save = () =>
    saver
      .run(() => (value.id ? adminApi.patch(`skills/${value.id}`, payload()) : adminApi.post("skills", payload())))
      .then((ok) => ok && close());
  const err = (k: string) => saver.fieldErrors[k]?.[0];

  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{value.id ? "Edit skill" : "New skill"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="grid gap-4">
          <Field label="Name" required error={err("name")}>
            {(p) => <Input {...p} value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} maxLength={60} required autoFocus />}
          </Field>
          <Field label="Category" required error={err("categoryId")}>
            {(p) => (
              <NativeSelect {...p} value={value.categoryId} onChange={(e) => setValue({ ...value, categoryId: e.target.value })} required>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </NativeSelect>
            )}
          </Field>
          <Field label="Label" hint="Optional, e.g. “Daily use”. Leave empty rather than inventing a level." error={err("proficiency")}>
            {(p) => <Input {...p} value={value.proficiency} onChange={(e) => setValue({ ...value, proficiency: e.target.value })} maxLength={40} />}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display order" error={err("sortOrder")}>
              {(p) => <Input {...p} type="number" value={value.sortOrder} onChange={(e) => setValue({ ...value, sortOrder: Number(e.target.value) })} />}
            </Field>
            <Field label="Visibility" error={err("status")}>
              {(p) => (
                <NativeSelect {...p} value={value.status} onChange={(e) => setValue({ ...value, status: e.target.value as ContentStatus })}>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </NativeSelect>
              )}
            </Field>
          </div>
          <Field label="Icon" error={err("iconId")}>
            {() => <MediaPicker value={value.icon} onChange={(icon) => setValue({ ...value, icon })} />}
          </Field>
          {saver.error && <p role="alert" className="text-sm text-destructive">{saver.error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            <Button type="submit" disabled={saver.saving}>{saver.saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SkillsManager({ categories, skills, q }: { categories: SkillCategory[]; skills: Skill[]; q?: string }) {
  const [skillDraft, setSkillDraft] = useState<SkillDraft | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(null);

  const newSkill = (categoryId: string): SkillDraft => ({ name: "", categoryId, proficiency: "", icon: null, sortOrder: 0, status: "PUBLISHED" });

  return (
    <>
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setCategoryDraft({ name: "", sortOrder: categories.length })}>
          <Plus /> New category
        </Button>
        <Button size="sm" disabled={!categories.length} onClick={() => setSkillDraft(newSkill(categories[0]?.id ?? ""))}>
          <Plus /> New skill
        </Button>
      </div>

      {!categories.length && (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">No categories yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Create a category such as “Frontend” or “Cloud”, then add skills to it.</p>
        </div>
      )}

      <div className="grid gap-4">
        {categories.map((category) => {
          const items = skills.filter((s) => s.category.id === category.id);
          return (
            <section key={category.id} className="rounded-xl border bg-card">
              <header className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
                <h2 className="text-sm font-medium">
                  {category.name} <span className="font-normal text-muted-foreground">· {category.skillCount ?? items.length}</span>
                </h2>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setSkillDraft(newSkill(category.id))}>
                    <Plus /> Add skill
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`Edit category ${category.name}`} onClick={() => setCategoryDraft({ id: category.id, name: category.name, sortOrder: category.sortOrder })}>
                    <Pencil />
                  </Button>
                  <DeleteButton endpoint={`skill-categories/${category.id}`} itemLabel={`category “${category.name}”`} iconOnly />
                </div>
              </header>
              {items.length ? (
                <ul className="divide-y">
                  {items.map((skill) => (
                    <li key={skill.id} className="flex items-center justify-between gap-3 px-4 py-2">
                      <button
                        type="button"
                        className="min-w-0 text-left text-sm hover:underline"
                        onClick={() => setSkillDraft({ id: skill.id, name: skill.name, categoryId: skill.category.id, proficiency: skill.proficiency ?? "", icon: skill.icon, sortOrder: skill.sortOrder, status: skill.status })}
                      >
                        {skill.name}
                        {skill.proficiency && <span className="text-muted-foreground"> · {skill.proficiency}</span>}
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        {skill.status !== "PUBLISHED" && <StatusBadge status={skill.status} />}
                        <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">{skill.sortOrder}</span>
                        <DeleteButton endpoint={`skills/${skill.id}`} itemLabel={`“${skill.name}”`} iconOnly />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-4 text-sm text-muted-foreground">{q ? "No matching skills." : "No skills in this category. Empty categories are hidden on the site."}</p>
              )}
            </section>
          );
        })}
      </div>

      <SkillDialog key={skillDraft?.id ?? (skillDraft ? "new" : "none")} draft={skillDraft} categories={categories} onClose={() => setSkillDraft(null)} />
      <CategoryDialog key={categoryDraft?.id ?? (categoryDraft ? "new" : "none")} draft={categoryDraft} onClose={() => setCategoryDraft(null)} />
    </>
  );
}
