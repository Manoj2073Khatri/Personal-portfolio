"use client";

import { FormActions } from "@/components/admin/form-actions";
import { Field, FormSection } from "@/components/admin/form-fields";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { SeoPanel } from "@/components/admin/seo-panel";
import { TagInput } from "@/components/admin/tag-input";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { nullIfEmpty, useEntityForm } from "@/lib/admin/use-entity-form";
import type { Article, ContentStatus, MediaRef } from "@/lib/cms/types";

type Values = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  tags: string[];
  status: ContentStatus;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  noIndex: boolean;
  coverImage: MediaRef | null;
  ogImage: MediaRef | null;
};

/** `<input type="datetime-local">` uses local time without a zone. */
function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function initialValues(a?: Article): Values {
  return {
    title: a?.title ?? "",
    slug: a?.slug ?? "",
    excerpt: a?.excerpt ?? "",
    body: a?.body ?? "",
    tags: a?.tags ?? [],
    status: a?.status ?? "DRAFT",
    publishedAt: toLocalInput(a?.publishedAt),
    seoTitle: a?.seoTitle ?? "",
    seoDescription: a?.seoDescription ?? "",
    canonicalUrl: a?.canonicalUrl ?? "",
    noIndex: a?.noIndex ?? false,
    coverImage: a?.coverImage ?? null,
    ogImage: a?.ogImage ?? null,
  };
}

function toPayload(v: Values) {
  return {
    title: v.title.trim(),
    ...(v.slug.trim() ? { slug: v.slug.trim() } : {}),
    excerpt: v.excerpt,
    body: v.body,
    tags: v.tags,
    status: v.status,
    // Empty means "use the first publish time", so only send an explicit date.
    ...(v.publishedAt ? { publishedAt: new Date(v.publishedAt).toISOString() } : {}),
    seoTitle: nullIfEmpty(v.seoTitle),
    seoDescription: nullIfEmpty(v.seoDescription),
    canonicalUrl: nullIfEmpty(v.canonicalUrl),
    noIndex: v.noIndex,
    coverImageId: v.coverImage?.id ?? null,
    ogImageId: v.ogImage?.id ?? null,
  };
}

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

export function ArticleForm({ article, siteName = "" }: { article?: Article; siteName?: string }) {
  const form = useEntityForm<Values, Article>(initialValues(article), {
    endpoint: "articles",
    id: article?.id,
    toPayload,
    basePath: "/admin/articles",
  });
  const { values: v, set, errorFor } = form;
  const count = words(v.body);

  return (
    <form onSubmit={(e) => { e.preventDefault(); void form.save(); }} className="grid gap-6">
      <FormSection title="Article">
        <Field label="Title" required error={errorFor("title")}>
          {(p) => <Input {...p} value={v.title} onChange={(e) => set("title", e.target.value)} maxLength={200} required className="text-base font-medium" />}
        </Field>
        <Field
          label="Slug"
          hint={
            article?.publishedAt
              ? "Changing the slug of a published article keeps the old URL working with a permanent redirect."
              : "URL: /articles/<slug>. Leave empty to generate from the title."
          }
          error={errorFor("slug")}
        >
          {(p) => <Input {...p} value={v.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} maxLength={80} placeholder="my-article" />}
        </Field>
        <Field label="Excerpt" hint="One or two sentences shown in article lists, feeds and as the default meta description." error={errorFor("excerpt")}>
          {(p) => <Textarea {...p} value={v.excerpt} onChange={(e) => set("excerpt", e.target.value)} maxLength={500} rows={2} />}
        </Field>
        <Field label="Body" hint={`Markdown · ${count} word${count === 1 ? "" : "s"} · about ${Math.max(1, Math.round(count / 220))} min read`} error={errorFor("body")}>
          {(p) => <MarkdownEditor {...p} value={v.body} onChange={(x) => set("body", x)} rows={24} />}
        </Field>
      </FormSection>

      <FormSection title="Presentation">
        <Field label="Tags" hint="Press Enter or comma to add. Used for filtering and as keywords." error={errorFor("tags")}>
          {(p) => <TagInput id={p.id} value={v.tags} onChange={(x) => set("tags", x)} />}
        </Field>
        <Field label="Cover image" hint="Shown at the top of the article and in lists. 16:9 works best." error={errorFor("coverImageId")}>
          {() => <MediaPicker value={v.coverImage} onChange={(m) => set("coverImage", m)} />}
        </Field>
        <Field label="Publish date" hint="Leave empty to use the moment you publish. A future date schedules the article." error={errorFor("publishedAt")}>
          {(p) => <Input {...p} type="datetime-local" value={v.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} className="sm:w-64" />}
        </Field>
      </FormSection>

      <SeoPanel
        values={v}
        onChange={(k, x) => set(k as keyof Values, x as never)}
        errorFor={errorFor}
        path={`/articles/${v.slug || "…"}`}
        fallbackTitle={v.title}
        fallbackDescription={v.excerpt}
        fallbackImageLabel="cover image"
        siteName={siteName}
        advanced
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
        previewHref={article ? `/admin/preview/articles/${article.id}` : undefined}
        isNew={!article}
      />
    </form>
  );
}
