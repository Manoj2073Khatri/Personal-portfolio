"use client";

import { FormActions } from "@/components/admin/form-actions";
import { Field, FormSection } from "@/components/admin/form-fields";
import { MediaPicker } from "@/components/admin/media-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { nullIfEmpty, useEntityForm } from "@/lib/admin/use-entity-form";
import type { ContentStatus, MediaRef, Testimonial } from "@/lib/cms/types";

type Values = {
  quote: string;
  authorName: string;
  authorTitle: string;
  authorCompany: string;
  avatar: MediaRef | null;
  sortOrder: number;
  status: ContentStatus;
};

const initial = (t?: Testimonial): Values => ({
  quote: t?.quote ?? "",
  authorName: t?.authorName ?? "",
  authorTitle: t?.authorTitle ?? "",
  authorCompany: t?.authorCompany ?? "",
  avatar: t?.avatar ?? null,
  sortOrder: t?.sortOrder ?? 0,
  status: t?.status ?? "DRAFT",
});

const toPayload = (v: Values) => ({
  quote: v.quote.trim(),
  authorName: v.authorName.trim(),
  authorTitle: nullIfEmpty(v.authorTitle),
  authorCompany: nullIfEmpty(v.authorCompany),
  avatarId: v.avatar?.id ?? null,
  sortOrder: Number(v.sortOrder) || 0,
  status: v.status,
});

export function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const form = useEntityForm<Values, Testimonial>(initial(testimonial), {
    endpoint: "testimonials",
    id: testimonial?.id,
    toPayload,
    basePath: "/admin/testimonials",
  });
  const { values: v, set, errorFor } = form;

  return (
    <form onSubmit={(e) => { e.preventDefault(); void form.save(); }} className="grid gap-6">
      <FormSection title="Testimonial" description="Only publish quotes you have permission to share.">
        <Field label="Quote" required error={errorFor("quote")}>
          {(p) => <Textarea {...p} value={v.quote} onChange={(e) => set("quote", e.target.value)} maxLength={1000} rows={4} required />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" required error={errorFor("authorName")}>
            {(p) => <Input {...p} value={v.authorName} onChange={(e) => set("authorName", e.target.value)} maxLength={100} required />}
          </Field>
          <Field label="Title" error={errorFor("authorTitle")}>
            {(p) => <Input {...p} value={v.authorTitle} onChange={(e) => set("authorTitle", e.target.value)} maxLength={100} />}
          </Field>
          <Field label="Company" error={errorFor("authorCompany")}>
            {(p) => <Input {...p} value={v.authorCompany} onChange={(e) => set("authorCompany", e.target.value)} maxLength={100} />}
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Photo" error={errorFor("avatarId")}>
            {() => <MediaPicker value={v.avatar} onChange={(m) => set("avatar", m)} />}
          </Field>
          <Field label="Display order" error={errorFor("sortOrder")}>
            {(p) => <Input {...p} type="number" value={v.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className="sm:w-32" />}
          </Field>
        </div>
      </FormSection>
      <FormActions
        status={v.status}
        onStatusChange={(s) => set("status", s)}
        onSave={(o) => { if (o?.status) set("status", o.status); void form.save(o); }}
        saving={form.saving}
        dirty={form.dirty}
        savedAt={form.savedAt}
        formError={form.formError}
        isNew={!testimonial}
      />
    </form>
  );
}
