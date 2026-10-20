import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { isExternal, safeHref } from "@/lib/format";

const components: Components = {
  a: ({ href, children }) => {
    const safe = safeHref(href);
    if (!safe) return <span>{children}</span>;
    if (isExternal(safe)) {
      return (
        <a href={safe} target="_blank" rel="noopener noreferrer nofollow">
          {children}
        </a>
      );
    }
    return <Link href={safe}>{children}</Link>;
  },
  img: ({ src, alt }) => {
    const safe = typeof src === "string" ? safeHref(src) : undefined;
    if (!safe) return null;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={safe} alt={alt ?? ""} loading="lazy" decoding="async" referrerPolicy="no-referrer" />;
  },
};

/**
 * Renders CMS Markdown. Raw HTML is skipped and URLs are restricted to
 * http(s)/mailto/relative (ADR 0004), so content cannot inject markup or script.
 */
export function Markdown({
  children,
  variant = "compact",
  className,
}: {
  children: string;
  /** `article` uses the long-form reading typography. */
  variant?: "compact" | "article";
  className?: string;
}) {
  return (
    <div className={cn(variant === "article" ? "prose-article" : "prose-compact", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
