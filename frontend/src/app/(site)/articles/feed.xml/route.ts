import { SITE_URL } from "@/components/site/json-ld";
import { getArticles, getSiteSettings } from "@/lib/cms/public-api";

// Cached with the rest of the CMS data; refreshed when content is published.
export const revalidate = 3600;

function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS 2.0 feed of the latest published articles. */
export async function GET() {
  const [settings, { data }] = await Promise.all([getSiteSettings(), getArticles(1)]);
  const items = data
    .map((a) => {
      const url = `${SITE_URL}/articles/${a.slug}`;
      return [
        "<item>",
        `<title>${escape(a.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        a.publishedAt ? `<pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>` : "",
        a.excerpt ? `<description>${escape(a.excerpt)}</description>` : "",
        ...a.tags.map((t) => `<category>${escape(t)}</category>`),
        "</item>",
      ].join("");
    })
    .join("\n");

  const title = `${settings.name || "Portfolio"} — Articles`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escape(title)}</title>
<link>${SITE_URL}/articles</link>
<atom:link href="${SITE_URL}/articles/feed.xml" rel="self" type="application/rss+xml"/>
<description>${escape(settings.seoDescription || `Articles by ${settings.name}`)}</description>
<language>en</language>
${data[0]?.publishedAt ? `<lastBuildDate>${new Date(data[0].publishedAt).toUTCString()}</lastBuildDate>` : ""}
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
