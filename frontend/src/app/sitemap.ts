import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/cms/public-api";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

// Rebuilt with the rest of the CMS cache whenever content is published.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { siteUpdatedAt, projects, articles } = await getSitemapData();
  const latest = [siteUpdatedAt, ...projects.map((p) => p.updatedAt), ...articles.map((a) => a.updatedAt)]
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);

  return [
    { url: `${SITE_URL}/`, lastModified: latest, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/projects`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/articles`, changeFrequency: "weekly", priority: 0.7 },
    ...projects.map((p) => ({ url: `${SITE_URL}/projects/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...articles.map((a) => ({ url: `${SITE_URL}/articles/${a.slug}`, lastModified: a.updatedAt, priority: 0.8 })),
  ];
}
