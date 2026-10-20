import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { loadOrNotFound } from "@/lib/auth/session";
import type { Credential } from "@/lib/cms/types";
import { CredentialForm } from "../credential-form";

export const metadata: Metadata = { title: "Edit entry" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const a = await loadOrNotFound<Credential>("credentials", (await params).id);
  return (
    <>
      <PageHeader
        title={`${a.title}`}
        back={{ href: "/admin/education", label: "Education & certifications" }}
        actions={<DeleteButton endpoint={`credentials/${a.id}`} itemLabel={`${a.title}`} redirectTo="/admin/education" />}
      />
      <CredentialForm credential={a} />
    </>
  );
}
