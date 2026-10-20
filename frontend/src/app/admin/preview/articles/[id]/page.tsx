import { ArticleView } from "@/components/site/article-view";
import { adminFetch, loadOrNotFound } from "@/lib/auth/session";
import type { Article, SiteSettings } from "@/lib/cms/types";
import { PreviewBanner } from "../../preview-banner";

export default async function ArticlePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, settings] = await Promise.all([
    loadOrNotFound<Article>("articles", id),
    adminFetch<SiteSettings>("/admin/settings"),
  ]);
  return (
    <ArticleView
      article={article}
      author={{ name: settings.name, title: settings.title, image: settings.profileImage }}
      banner={<PreviewBanner status={article.status} editHref={`/admin/articles/${article.id}`} scheduledFor={article.publishedAt} />}
    />
  );
}
