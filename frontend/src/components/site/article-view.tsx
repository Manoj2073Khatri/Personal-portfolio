import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { MediaRef, PublicArticle } from "@/lib/cms/types";
import { formatDate } from "@/lib/format";
import { CmsImage, Initials } from "./cms-image";
import { TagLink } from "./article-list";
import { Markdown } from "./markdown";

interface ArticleViewProps {
  article: PublicArticle;
  author: { name: string; title?: string; image?: MediaRef | null };
  /** Shown above the article in admin preview. */
  banner?: React.ReactNode;
}

/** Full article reading view. Shared by the public page and the admin preview. */
export function ArticleView({ article, author, banner }: ArticleViewProps) {
  const authorName = article.author.name || author.name;

  return (
    <article className="mx-auto w-full max-w-2xl px-4 pt-6 pb-20 sm:px-6 lg:px-8">
      <div className="reading-progress" aria-hidden="true" />
      {banner}

      <Link
        href="/articles"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-neutral-500 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        All articles
      </Link>

      <header className="mt-10">
        <p className="font-mono text-xs text-gray-500 dark:text-neutral-500">
          {article.publishedAt && <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>}
          {article.publishedAt && <span aria-hidden="true"> · </span>}
          {article.readingTimeMinutes} min read
        </p>

        <h1 className="mt-4 text-3xl leading-[1.15] font-semibold tracking-tight text-balance text-gray-900 sm:text-[2.6rem] dark:text-neutral-50">
          <span className="highlight-stroke">{article.title}</span>
        </h1>

        {article.excerpt && (
          <p className="mt-5 font-reading text-lg leading-relaxed text-pretty text-gray-600 sm:text-xl dark:text-neutral-400">
            {article.excerpt}
          </p>
        )}

        <div className="mt-7 flex items-center gap-3 border-y border-gray-200 py-4 dark:border-neutral-800">
          <CmsImage
            media={author.image}
            alt=""
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
            fallback={<Initials name={authorName} className="size-9" />}
          />
          <div className="text-sm leading-tight">
            <p className="font-medium text-gray-900 dark:text-neutral-100">{authorName}</p>
            {author.title && <p className="text-gray-500 dark:text-neutral-500">{author.title}</p>}
          </div>
        </div>
      </header>

      {article.coverImage && (
        <figure className="-mx-4 mt-8 sm:mx-0">
          <CmsImage
            media={article.coverImage}
            priority
            className="aspect-[16/9] w-full bg-gray-100 object-cover sm:rounded-2xl sm:ring-1 sm:ring-gray-200 dark:bg-neutral-800 dark:sm:ring-neutral-800"
          />
          {article.coverImage.alt && (
            <figcaption className="mt-2 px-4 text-center text-xs text-gray-500 sm:px-0 dark:text-neutral-500">
              {article.coverImage.alt}
            </figcaption>
          )}
        </figure>
      )}

      {article.body ? (
        <Markdown variant="article" className="mt-10">
          {article.body}
        </Markdown>
      ) : null}

      <footer className="mt-16 space-y-8">
        {article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-neutral-500">Filed under</span>
            {article.tags.map((tag) => (
              <TagLink key={tag} tag={tag} />
            ))}
          </div>
        )}
        <div className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:bg-neutral-900">
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            Written by <span className="font-medium text-gray-900 dark:text-neutral-100">{authorName}</span>. Questions
            or feedback? Get in touch.
          </p>
          <Link
            href="/#contact"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Send a message
          </Link>
        </div>
      </footer>
    </article>
  );
}
