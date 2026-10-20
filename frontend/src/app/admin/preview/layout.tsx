import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

/** Draft previews render with the public components, behind the admin check. */
export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
