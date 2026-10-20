import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSiteSettings } from "@/lib/cms/public-api";
import { siteName } from "@/lib/cms/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = siteName(settings);
  const title = settings.seoTitle || [name, settings.title].filter(Boolean).join(" — ");
  const image = settings.ogImage ?? settings.profileImage;
  return {
    title: { default: title, template: `%s — ${name}` },
    description: settings.seoDescription ?? undefined,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description: settings.seoDescription ?? undefined,
      siteName: name,
      type: "website",
      images: image ? [{ url: image.url, alt: image.alt || name }] : undefined,
    },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow dark:focus:bg-neutral-900"
      >
        Skip to content
      </a>
      <SiteHeader name={settings.name} navigation={settings.navigation} />
      {children}
      <SiteFooter footerText={settings.footerText} socialLinks={settings.socialLinks} />
    </>
  );
}
