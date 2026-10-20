import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { CredentialForm } from "../credential-form";

export const metadata: Metadata = { title: "New entry" };

export default async function NewPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  return (
    <>
      <PageHeader title="New entry" back={{ href: "/admin/education", label: "Education & certifications" }} />
      <CredentialForm defaultKind={kind === "CERTIFICATION" ? "CERTIFICATION" : "EDUCATION"} />
    </>
  );
}
