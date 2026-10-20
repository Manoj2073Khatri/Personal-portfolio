import Link from "next/link";
import type { ArticleSummary } from "@/lib/cms/types";
import { yearOf } from "@/lib/format";
import { CmsImage } from "./cms-image";

const dayMonth = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });

function groupByYear(articles: ArticleSummary[]) {
  const groups = new Map<string, ArticleSummary[]>();
  for (const article of articles) {
    const year = yearOf(article.publishedAt) || "Undated";
    groups.set(year, [...(groups.get(year) ?? []), article]);
  }
  return [...groups.entries()];
}

export function TagLink({ tag, active = false }: { tag: string; active?: boolean }) {
  return (
    <Link
      href={active ? "/articles" : `/articles?tag=${encodeURIComponent(tag)}`}
      aria-current={active ? "true" : undefined}
      className={
        active
          ? "rounded-md bg-highlight px-1.5 py-0.5 font-mono text-[11px] text-black"
          : "rounded-md px-1.5 py-0.5 font-mono text-[11px] text-gray-500 ring-1 ring-gray-200 ring-inset hover:text-gray-900 hover:ring-gray-400 dark:text-neutral-400 dark:ring-neutral-700 dark:hover:text-neutral-100"
      }
    >
      #{tag}
    </Link>
  );
}

function ArticleRow({ article, showCover }: { article: ArticleSummary; showCover: boolean }) {
  return (
    <li className="group relative grid grid-cols-[3.75rem_1fr] gap-x-4 sm:grid-cols-[4.5rem_1fr_auto]">
      <time
        dateTime={article.publishedAt ?? undefined}
        className="pt-0.5 font-mono text-xs text-gray-400 tabular-nums dark:text-neutral-500"
      >
        {article.publishedAt ? dayMonth.format(new Date(article.publishedAt)) : "—"}
      </time>

      <div className="min-w-0">
        <h3 className="text-[0.95rem] leading-snug font-medium text-gray-900 dark:text-neutral-100">
          <Link
            href={`/articles/${article.slug}`}
            className="bg-[length:0%_0.32em] bg-[position:0_88%] bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_0.32em] focus:outline-hidden focus-visible:bg-[length:100%_0.32em] motion-reduce:transition-none [background-image:linear-gradient(var(--highlight),var(--highlight))] after:absolute after:inset-0"
          >
            {article.title}
          </Link>
        </h3>
        {article.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-neutral-500">{article.excerpt}</p>
        )}
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-gray-400 dark:text-neutral-500">
          <span>{article.readingTimeMinutes} min read</span>
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </p>
      </div>

      {showCover && article.coverImage && (
        <CmsImage
          media={article.coverImage}
          alt=""
          className="hidden h-16 w-24 rounded-md object-cover ring-1 ring-gray-200 sm:block dark:ring-neutral-800"
        />
      )}
    </li>
  );
}

/** Articles grouped under their publication year, newest first. */
export function ArticleList({
  articles,
  showCovers = false,
}: {
  articles: ArticleSummary[];
  showCovers?: boolean;
}) {
  return (
    <div className="space-y-10">
      {groupByYear(articles).map(([year, items]) => (
        <section key={year} aria-label={year}>
          <h3 className="mb-4 flex items-center gap-3 text-sm text-gray-500 dark:text-neutral-500">
            <span className="font-mono">{year}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-gray-200 dark:bg-neutral-800" />
          </h3>
          <ul className="space-y-7">
            {items.map((article) => (
              <ArticleRow key={article.id} article={article} showCover={showCovers} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
