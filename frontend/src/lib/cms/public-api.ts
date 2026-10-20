import "server-only";
import { cache } from "react";
import { CMS_CACHE_TAG, CMS_REVALIDATE_SECONDS, cmsApiUrl, internalHeaders } from "./config";
import { CmsApiError } from "./errors";
import type {
  ArticleSummary,
  HomeData,
  Paginated,
  PublicArticle,
  PublicProject,
  SiteSettings,
  SitemapData,
} from "./types";

/**
 * Public (published-only) CMS reads. Responses are kept in the Next.js data
 * cache under the `cms` tag and refreshed when the admin publishes changes.
 * See docs/data-fetching.md.
 */
async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${cmsApiUrl()}/public${path}`, {
    headers: { accept: "application/json", ...internalHeaders() },
    next: { tags: [CMS_CACHE_TAG], revalidate: CMS_REVALIDATE_SECONDS },
  });
  if (!res.ok) throw await CmsApiError.fromResponse(res);
  return (await res.json()) as T;
}

/** Returns null for 404s so pages can call notFound(); other errors propagate. */
async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof CmsApiError && error.status === 404) return null;
    throw error;
  }
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// React `cache` de-duplicates calls made by generateMetadata and the page in one render.
export const getSiteSettings = cache(() => publicFetch<SiteSettings>("/site"));

export const getHome = cache(() => publicFetch<HomeData>("/home"));

export const getProjects = cache((page = 1, skill?: string) =>
  publicFetch<Paginated<PublicProject>>(`/projects${query({ page, limit: 24, skill })}`),
);

export const getProject = cache((slug: string) =>
  orNull(publicFetch<PublicProject>(`/projects/${encodeURIComponent(slug)}`)),
);

export const getArticles = cache((page = 1, tag?: string) =>
  publicFetch<Paginated<ArticleSummary>>(`/articles${query({ page, limit: 10, tag })}`),
);

export const getArticleTags = cache(() =>
  publicFetch<{ tag: string; count: number }[]>("/articles/tags"),
);

export const getArticle = cache((slug: string) =>
  orNull(publicFetch<PublicArticle>(`/articles/${encodeURIComponent(slug)}`)),
);

export const getSitemapData = cache(() => publicFetch<SitemapData>("/sitemap"));
