"use client";

import { FormActions } from "@/components/admin/form-actions";
import { CheckboxField, Field, FormSection } from "@/components/admin/form-fields";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { GalleryPicker, MediaPicker } from "@/components/admin/media-picker";
import { SeoPanel } from "@/components/admin/seo-panel";
import { SkillPicker } from "@/components/admin/skill-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fromDateInput, nullIfEmpty, toDateInput, useEntityForm } from "@/lib/admin/use-entity-form";
import type { ContentStatus, MediaRef, Project, SkillRef } from "@/lib/cms/types";

type Values = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  role: string;
  liveUrl: string;
  repoUrl: string;
  startDate: string;
  endDate: string;
  featured: boolean;
  sortOrder: number;
  status: ContentStatus;
  seoTitle: string;
  seoDescription: string;
  thumbnail: MediaRef | null;
  ogImage: MediaRef | null;
  gallery: MediaRef[];
  skills: SkillRef[];
};

function initialValues(p?: Project): Values {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    summary: p?.summary ?? "",
    body: p?.body ?? "",
    role: p?.role ?? "",
    liveUrl: p?.liveUrl ?? "",
    repoUrl: p?.repoUrl ?? "",
    startDate: toDateInput(p?.startDate),
    endDate: toDateInput(p?.endDate),
    featured: p?.featured ?? false,
    sortOrder: p?.sortOrder ?? 0,
    status: p?.status ?? "DRAFT",
    seoTitle: p?.seoTitle ?? "",
    seoDescription: p?.seoDescription ?? "",
    thumbnail: p?.thumbnail ?? null,
    ogImage: p?.ogImage ?? null,
    gallery: p?.gallery ?? [],
    skills: p?.skills ?? [],
  };
}

function toPayload(v: Values) {
  return {
    title: v.title.trim(),
    ...(v.slug.trim() ? { slug: v.slug.trim() } : {}),
    summary: v.summary,
    body: v.body,
    role: nullIfEmpty(v.role),
    liveUrl: nullIfEmpty(v.liveUrl),
    repoUrl: nullIfEmpty(v.repoUrl),
    startDate: fromDateInput(v.startDate),
    endDate: fromDateInput(v.endDate),
    featured: v.featured,
    sortOrder: Number(v.sortOrder) || 0,
    status: v.status,
    seoTitle: nullIfEmpty(v.seoTitle),
    seoDescription: nullIfEmpty(v.seoDescription),
    thumbnailId: v.thumbnail?.id ?? null,
    ogImageId: v.ogImage?.id ?? null,
    galleryIds: v.gallery.map((m) => m.id),
    skillIds: v.skills.map((s) => s.id),
  };
}

export function ProjectForm({ project, siteName = "" }: { project?: Project; siteName?: string }) {
  const form = useEntityForm<Values, Project>(initialValues(project), {
    endpoint: "projects",
    id: project?.id,
    toPayload,
    basePath: "/admin/projects",
  });
  const { values: v, set, errorFor } = form;

  return (
    <form onSubmit={(e) => { e.preventDefault(); void form.save(); }} className="grid gap-6">
      <FormSection title="Basics">
        <Field label="Title" required error={errorFor("title")}>
          {(p) => <Input {...p} value={v.title} onChange={(e) => set("title", e.target.value)} maxLength={150} required />}
        </Field>
        <Field label="Slug" hint="URL: /projects/<slug>. Leave empty to generate from the title." error={errorFor("slug")}>
          {(p) => <Input {...p} value={v.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} maxLength={80} placeholder="my-project" />}
        </Field>
        <Field label="Short description" hint="Shown on project cards. Up to 500 characters." error={errorFor("summary")}>
          {(p) => <Textarea {...p} value={v.summary} onChange={(e) => set("summary", e.target.value)} maxLength={500} rows={2} />}
        </Field>
        <Field label="Full description" hint="Markdown." error={errorFor("body")}>
          {(p) => <MarkdownEditor {...p} value={v.body} onChange={(x) => set("body", x)} />}
        </Field>
      </FormSection>

      <FormSection title="Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your role" error={errorFor("role")}>
            {(p) => <Input {...p} value={v.role} onChange={(e) => set("role", e.target.value)} maxLength={120} placeholder="Lead frontend developer" />}
          </Field>
          <Field label="Display order" hint="Lower numbers appear first." error={errorFor("sortOrder")}>
            {(p) => <Input {...p} type="number" value={v.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />}
          </Field>
          <Field label="Live URL" error={errorFor("liveUrl")}>
            {(p) => <Input {...p} type="url" value={v.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} placeholder="https://" />}
          </Field>
          <Field label="Repository URL" error={errorFor("repoUrl")}>
            {(p) => <Input {...p} type="url" value={v.repoUrl} onChange={(e) => set("repoUrl", e.target.value)} placeholder="https://github.com/…" />}
          </Field>
          <Field label="Start date" error={errorFor("startDate")}>
            {(p) => <Input {...p} type="date" value={v.startDate} onChange={(e) => set("startDate", e.target.value)} />}
          </Field>
          <Field label="End date" error={errorFor("endDate")}>
            {(p) => <Input {...p} type="date" value={v.endDate} onChange={(e) => set("endDate", e.target.value)} />}
          </Field>
        </div>
        <CheckboxField label="Featured" hint="Featured projects can be highlighted on the homepage." checked={v.featured} onChange={(x) => set("featured", x)} />
        <Field label="Technologies" error={errorFor("skillIds")}>
          {() => <SkillPicker value={v.skills} onChange={(x) => set("skills", x)} />}
        </Field>
      </FormSection>

      <FormSection title="Images">
        <Field label="Thumbnail" error={errorFor("thumbnailId")}>
          {() => <MediaPicker value={v.thumbnail} onChange={(m) => set("thumbnail", m)} />}
        </Field>
        <Field label="Gallery" error={errorFor("galleryIds")}>
          {() => <GalleryPicker value={v.gallery} onChange={(m) => set("gallery", m)} />}
        </Field>
      </FormSection>

      <SeoPanel
        values={v}
        onChange={(k, x) => set(k as keyof Values, x as never)}
        errorFor={errorFor}
        path={`/projects/${v.slug || "…"}`}
        fallbackTitle={v.title}
        fallbackDescription={v.summary}
        fallbackImageLabel="thumbnail"
        siteName={siteName}
      />

      <FormActions
        status={v.status}
        onStatusChange={(s) => set("status", s)}
        onSave={(o) => {
          if (o?.status) set("status", o.status);
          void form.save(o);
        }}
        saving={form.saving}
        dirty={form.dirty}
        savedAt={form.savedAt}
        formError={form.formError}
        previewHref={project ? `/admin/preview/projects/${project.id}` : undefined}
        isNew={!project}
      />
    </form>
  );
}
