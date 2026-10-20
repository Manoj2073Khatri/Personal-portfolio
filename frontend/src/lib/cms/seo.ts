import type { Metadata } from "next";
import type { MediaRef, SiteSettings } from "./types";

export function siteName(settings: SiteSettings): string {
  return settings.name || "Portfolio";
}

/** Shared Open Graph / Twitter metadata for content pages. */
export function contentMetadata({
  settings,
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  canonical,
  noIndex = false,
}: {
  settings: SiteSettings;
  title: string;
  description?: string | null;
  path: string;
  image?: MediaRef | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  tags?: string[];
  /** Absolute canonical URL overriding `path` (cross-posted content). */
  canonical?: string | null;
  noIndex?: boolean;
}): Metadata {
  const ogImage = image ?? settings.ogImage ?? settings.profileImage;
  const images = ogImage
    ? [{ url: ogImage.url, alt: ogImage.alt || title, width: ogImage.width ?? undefined, height: ogImage.height ?? undefined }]
    : undefined;
  const desc = metaDescription(description, settings.seoDescription);
  return {
    title,
    description: desc,
    alternates: {
      canonical: canonical || path,
      types: { "application/rss+xml": [{ url: "/articles/feed.xml", title: `${siteName(settings)} — Articles` }] },
    },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description: desc,
      url: canonical || path,
      siteName: siteName(settings),
      type,
      images,
      ...(type === "article"
        ? {
            publishedTime: publishedTime ?? undefined,
            modifiedTime: modifiedTime ?? undefined,
            authors: [siteName(settings)],
            tags,
          }
        : {}),
    },
    twitter: { card: images ? "summary_large_image" : "summary", title, description: desc, images: images?.map((i) => i.url) },
  };
}

/** Search-result description: explicit SEO text, else the summary, trimmed to ~160 chars. */
export function metaDescription(...candidates: (string | null | undefined)[]): string | undefined {
  const text = candidates.find((c) => c?.trim())?.trim().replace(/\s+/g, " ");
  if (!text) return undefined;
  return text.length <= 160 ? text : `${text.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}
