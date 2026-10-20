import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { getSiteNameForAdmin, loadOrNotFound } from "@/lib/auth/session";
import type { Article } from "@/lib/cms/types";
import { ArticleForm } from "../article-form";

export const metadata: Metadata = { title: "Edit article" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const [article, siteName] = await Promise.all([
    loadOrNotFound<Article>("articles", (await params).id),
    getSiteNameForAdmin(),
  ]);
  return (
    <>
      <PageHeader
        title={article.title}
        back={{ href: "/admin/articles", label: "Articles" }}
        actions={<DeleteButton endpoint={`articles/${article.id}`} itemLabel={`“${article.title}”`} redirectTo="/admin/articles" />}
      />
      <ArticleForm article={article} siteName={siteName} />
    </>
  );
}
