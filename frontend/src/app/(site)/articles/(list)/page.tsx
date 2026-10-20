import type { Metadata } from "next";
import { ArticleList, TagLink } from "@/components/site/article-list";
import { Pagination } from "@/components/site/pagination";
import { PageContainer } from "@/components/site/section";
import { getArticleTags, getArticles, getSiteSettings } from "@/lib/cms/public-api";
import { contentMetadata } from "@/lib/cms/seo";

type Props = { searchParams: Promise<{ page?: string; tag?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return contentMetadata({
    settings,
    title: "Articles",
    description: `Writing by ${settings.name} on software development.`,
    path: "/articles",
  });
}

export default async function ArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const tag = params.tag && /^[\w.+#-]{1,40}$/.test(params.tag) ? params.tag.toLowerCase() : undefined;
  const [{ data, meta }, tags] = await Promise.all([getArticles(page, tag), getArticleTags()]);

  return (
    <PageContainer>
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-50">
          <span className="highlight-stroke">Articles</span>
        </h1>
        <p className="mt-3 max-w-prose text-sm text-gray-600 dark:text-neutral-400">
          Notes on building for the web — front end, back end and the parts in between.
        </p>
        {tags.length > 0 && (
          <nav aria-label="Filter by tag" className="mt-6 flex flex-wrap gap-2">
            {tags.map(({ tag: t }) => (
              <TagLink key={t} tag={t} active={t === tag} />
            ))}
          </nav>
        )}
      </header>

      <div className="mt-12">
        {data.length ? (
          <ArticleList articles={data} showCovers />
        ) : (
          <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-neutral-700 dark:text-neutral-500">
            {tag ? `No articles tagged #${tag} yet.` : "No articles published yet. Check back soon."}
          </p>
        )}
      </div>
      <Pagination meta={meta} basePath="/articles" params={{ tag }} labels={["← Newer", "Older →"]} />
    </PageContainer>
  );
}
