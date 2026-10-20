"use client";

import { CheckboxField, Field, FormSection } from "@/components/admin/form-fields";
import { MediaPicker } from "@/components/admin/media-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MediaRef } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 155;

function Counter({ value, limit }: { value: string; limit: number }) {
  const over = value.length > limit;
  return (
    <span className={cn("tabular-nums", over ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
      {value.length}/{limit}
      {over && " · may be cut off in results"}
    </span>
  );
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** Approximation of a search result, so authors can judge title and description. */
function SnippetPreview({ url, title, description }: { url: string; title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-background p-4" aria-label="Search result preview">
      <p className="truncate text-xs text-muted-foreground">{url}</p>
      <p className="mt-1 truncate text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{truncate(title || "Untitled", TITLE_LIMIT + 5)}</p>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {description ? truncate(description, DESCRIPTION_LIMIT + 5) : <em>No description — search engines will pick text from the page.</em>}
      </p>
    </div>
  );
}

export interface SeoValues {
  seoTitle: string;
  seoDescription: string;
  ogImage: MediaRef | null;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export function SeoPanel({
  values,
  onChange,
  errorFor,
  path,
  fallbackTitle,
  fallbackDescription,
  fallbackImageLabel,
  siteName,
  advanced = false,
}: {
  values: SeoValues;
  onChange: <K extends keyof SeoValues>(key: K, value: SeoValues[K]) => void;
  errorFor: (key: string) => string | undefined;
  /** Public path, e.g. /articles/my-post. */
  path: string;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackImageLabel: string;
  siteName: string;
  /** Show canonical URL and noindex controls (articles). */
  advanced?: boolean;
}) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const shownTitle = `${values.seoTitle || fallbackTitle}${siteName ? ` — ${siteName}` : ""}`;
  const shownDescription = (values.seoDescription || fallbackDescription).replace(/\s+/g, " ").trim();

  return (
    <FormSection title="Search & sharing" description="How this page appears in search results and when shared. Empty fields fall back to the content.">
      <SnippetPreview url={`${siteUrl}${path}`.replace(/\//g, " › ").replace(/^ › /, "")} title={shownTitle} description={shownDescription} />

      <Field label="SEO title" hint={`Defaults to “${fallbackTitle || "the title"}”.`} error={errorFor("seoTitle")}>
        {(p) => (
          <div className="grid gap-1">
            <Input {...p} value={values.seoTitle} onChange={(e) => onChange("seoTitle", e.target.value)} maxLength={70} placeholder={fallbackTitle} />
            <span className="text-xs"><Counter value={shownTitle} limit={TITLE_LIMIT} /> (including site name)</span>
          </div>
        )}
      </Field>

      <Field label="Meta description" hint="Defaults to the summary. Aim for 120–155 characters." error={errorFor("seoDescription")}>
        {(p) => (
          <div className="grid gap-1">
            <Textarea {...p} value={values.seoDescription} onChange={(e) => onChange("seoDescription", e.target.value)} maxLength={200} rows={3} placeholder={fallbackDescription} />
            <span className="text-xs"><Counter value={shownDescription} limit={DESCRIPTION_LIMIT} /></span>
          </div>
        )}
      </Field>

      <Field label="Social sharing image" hint={`Recommended 1200×630. Falls back to the ${fallbackImageLabel}.`} error={errorFor("ogImageId")}>
        {() => <MediaPicker value={values.ogImage} onChange={(m) => onChange("ogImage", m)} />}
      </Field>

      {advanced && (
        <>
          <Field label="Canonical URL" hint="Only if this was first published elsewhere (e.g. dev.to). Search engines will credit that URL." error={errorFor("canonicalUrl")}>
            {(p) => <Input {...p} type="url" value={values.canonicalUrl ?? ""} onChange={(e) => onChange("canonicalUrl", e.target.value)} placeholder="https://" />}
          </Field>
          <CheckboxField
            label="Hide from search engines"
            hint="Adds noindex and leaves the page out of the sitemap. The page stays reachable by link."
            checked={!!values.noIndex}
            onChange={(x) => onChange("noIndex", x)}
          />
        </>
      )}
    </FormSection>
  );
}
