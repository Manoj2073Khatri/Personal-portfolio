import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { getSiteNameForAdmin } from "@/lib/auth/session";
import { ArticleForm } from "../article-form";

export const metadata: Metadata = { title: "New article" };

export default async function NewArticlePage() {
  return (
    <>
      <PageHeader title="New article" back={{ href: "/admin/articles", label: "Articles" }} />
      <ArticleForm siteName={await getSiteNameForAdmin()} />
    </>
  );
}
