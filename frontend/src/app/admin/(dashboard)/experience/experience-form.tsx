"use client";

import { FormActions } from "@/components/admin/form-actions";
import { CheckboxField, Field, FormSection } from "@/components/admin/form-fields";
import { MediaPicker } from "@/components/admin/media-picker";
import { SkillPicker } from "@/components/admin/skill-picker";
import { cleanList, StringListEditor } from "@/components/admin/string-list-editor";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { fromDateInput, nullIfEmpty, toDateInput, useEntityForm } from "@/lib/admin/use-entity-form";
import type { ContentStatus, EmploymentType, Experience, MediaRef, SkillRef } from "@/lib/cms/types";

type Values = {
  company: string;
  companyUrl: string;
  role: string;
  employmentType: EmploymentType;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  summary: string;
  responsibilities: string[];
  achievements: string[];
  skills: SkillRef[];
  logo: MediaRef | null;
  sortOrder: number;
  status: ContentStatus;
};

const EMPLOYMENT: { value: EmploymentType; label: string }[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Internship" },
];

const initial = (e?: Experience): Values => ({
  company: e?.company ?? "",
  companyUrl: e?.companyUrl ?? "",
  role: e?.role ?? "",
  employmentType: e?.employmentType ?? "FULL_TIME",
  location: e?.location ?? "",
  startDate: toDateInput(e?.startDate),
  endDate: toDateInput(e?.endDate),
  isCurrent: e?.isCurrent ?? false,
  summary: e?.summary ?? "",
  responsibilities: e?.responsibilities ?? [],
  achievements: e?.achievements ?? [],
  skills: e?.skills ?? [],
  logo: e?.logo ?? null,
  sortOrder: e?.sortOrder ?? 0,
  status: e?.status ?? "PUBLISHED",
});

const toPayload = (v: Values) => ({
  company: v.company.trim(),
  companyUrl: nullIfEmpty(v.companyUrl),
  role: v.role.trim(),
  employmentType: v.employmentType,
  location: nullIfEmpty(v.location),
  // Required by the API; an empty value surfaces as a field error.
  startDate: fromDateInput(v.startDate) ?? "",
  endDate: v.isCurrent ? null : fromDateInput(v.endDate),
  isCurrent: v.isCurrent,
  summary: v.summary,
  responsibilities: cleanList(v.responsibilities),
  achievements: cleanList(v.achievements),
  skillIds: v.skills.map((s) => s.id),
  logoId: v.logo?.id ?? null,
  sortOrder: Number(v.sortOrder) || 0,
  status: v.status,
});

export function ExperienceForm({ experience }: { experience?: Experience }) {
  const form = useEntityForm<Values, Experience>(initial(experience), {
    endpoint: "experiences",
    id: experience?.id,
    toPayload,
    basePath: "/admin/experience",
  });
  const { values: v, set, errorFor } = form;

  return (
    <form onSubmit={(e) => { e.preventDefault(); void form.save(); }} className="grid gap-6">
      <FormSection title="Role">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" required error={errorFor("company")}>
            {(p) => <Input {...p} value={v.company} onChange={(e) => set("company", e.target.value)} maxLength={120} required />}
          </Field>
          <Field label="Role" required error={errorFor("role")}>
            {(p) => <Input {...p} value={v.role} onChange={(e) => set("role", e.target.value)} maxLength={120} required />}
          </Field>
          <Field label="Employment type" error={errorFor("employmentType")}>
            {(p) => (
              <NativeSelect {...p} value={v.employmentType} onChange={(e) => set("employmentType", e.target.value as EmploymentType)}>
                {EMPLOYMENT.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </NativeSelect>
            )}
          </Field>
          <Field label="Location" error={errorFor("location")}>
            {(p) => <Input {...p} value={v.location} onChange={(e) => set("location", e.target.value)} maxLength={120} placeholder="Remote" />}
          </Field>
          <Field label="Company website" error={errorFor("companyUrl")}>
            {(p) => <Input {...p} type="url" value={v.companyUrl} onChange={(e) => set("companyUrl", e.target.value)} placeholder="https://" />}
          </Field>
          <Field label="Display order" hint="Lower first. Ties sort current roles, then newest." error={errorFor("sortOrder")}>
            {(p) => <Input {...p} type="number" value={v.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />}
          </Field>
          <Field label="Start date" required error={errorFor("startDate")}>
            {(p) => <Input {...p} type="date" value={v.startDate} onChange={(e) => set("startDate", e.target.value)} required />}
          </Field>
          <Field label="End date" error={errorFor("endDate")}>
            {(p) => <Input {...p} type="date" value={v.isCurrent ? "" : v.endDate} disabled={v.isCurrent} onChange={(e) => set("endDate", e.target.value)} />}
          </Field>
        </div>
        <CheckboxField label="I currently work here" checked={v.isCurrent} onChange={(x) => set("isCurrent", x)} />
        <Field label="Company logo" error={errorFor("logoId")}>
          {() => <MediaPicker value={v.logo} onChange={(m) => set("logo", m)} />}
        </Field>
      </FormSection>

      <FormSection title="What you did">
        <Field label="Summary" hint="Optional one-paragraph overview." error={errorFor("summary")}>
          {(p) => <Textarea {...p} value={v.summary} onChange={(e) => set("summary", e.target.value)} maxLength={1000} rows={2} />}
        </Field>
        <Field label="Responsibilities" error={errorFor("responsibilities")}>
          {() => <StringListEditor value={v.responsibilities} onChange={(x) => set("responsibilities", x)} addLabel="Add responsibility" />}
        </Field>
        <Field label="Achievements" hint="Concrete outcomes. Leave empty rather than guessing." error={errorFor("achievements")}>
          {() => <StringListEditor value={v.achievements} onChange={(x) => set("achievements", x)} addLabel="Add achievement" />}
        </Field>
        <Field label="Technologies" error={errorFor("skillIds")}>
          {() => <SkillPicker value={v.skills} onChange={(x) => set("skills", x)} />}
        </Field>
      </FormSection>

      <FormActions
        status={v.status}
        onStatusChange={(s) => set("status", s)}
        onSave={(o) => { if (o?.status) set("status", o.status); void form.save(o); }}
        saving={form.saving}
        dirty={form.dirty}
        savedAt={form.savedAt}
        formError={form.formError}
        isNew={!experience}
      />
    </form>
  );
}
