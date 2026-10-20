import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { adminFetch } from "@/lib/auth/session";
import type { SiteSettings } from "@/lib/cms/types";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await adminFetch<SiteSettings>("/admin/settings");
  return (
    <>
      <PageHeader title="Site settings" description="Profile, contact details, homepage layout, navigation and search defaults." />
      <SettingsForm settings={settings} />
    </>
  );
}
