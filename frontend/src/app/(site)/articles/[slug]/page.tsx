import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ArticleView } from "@/components/site/article-view";
import { breadcrumbs, JsonLd, SITE_URL } from "@/components/site/json-ld";
import { getArticle, getSiteSettings, getSitemapData } from "@/lib/cms/public-api";
import { contentMetadata, metaDescription } from "@/lib/cms/seo";

type Props = { params: Promise<{ slug: string }> };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function generateStaticParams() {
  const { articles } = await getSitemapData();
  return articles.map(({ slug }) => ({ slug }));
}

async function load(slug: string) {
  return SLUG.test(slug) ? getArticle(slug) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [article, settings] = await Promise.all([load(slug), getSiteSettings()]);
  // Throwing here (not only in the page) lets crawlers get a real 404 status.
  if (!article) notFound();
  return contentMetadata({
    settings,
    title: article.seoTitle || article.title,
    description: metaDescription(article.seoDescription, article.excerpt),
    path: `/articles/${article.slug}`,
    image: article.ogImage ?? article.coverImage,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    tags: article.tags,
    canonical: article.canonicalUrl,
    noIndex: article.noIndex,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article, settings] = await Promise.all([load(slug), getSiteSettings()]);
  if (!article) notFound();
  // Found via an old slug: send visitors and crawlers to the current URL (308).
  if (article.slug !== slug) permanentRedirect(`/articles/${article.slug}`);

  const url = `${SITE_URL}/articles/${article.slug}`;
  const image = article.ogImage ?? article.coverImage;
  const authorName = article.author.name || settings.name;

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: article.seoTitle || article.title,
            description: metaDescription(article.seoDescription, article.excerpt),
            url,
            mainEntityOfPage: { "@type": "WebPage", "@id": article.canonicalUrl || url },
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            author: { "@type": "Person", name: authorName, url: SITE_URL },
            publisher: { "@type": "Person", name: settings.name, url: SITE_URL },
            image: image ? [image.url] : undefined,
            keywords: article.tags.length ? article.tags.join(", ") : undefined,
            wordCount: article.body.split(/\s+/).filter(Boolean).length,
            timeRequired: `PT${article.readingTimeMinutes}M`,
            inLanguage: "en",
          },
          breadcrumbs(SITE_URL, [
            { name: "Home", path: "/" },
            { name: "Articles", path: "/articles" },
            { name: article.title, path: `/articles/${article.slug}` },
          ]),
        ]}
      />
      <ArticleView article={article} author={{ name: authorName, title: settings.title, image: settings.profileImage }} />
    </>
  );
}
