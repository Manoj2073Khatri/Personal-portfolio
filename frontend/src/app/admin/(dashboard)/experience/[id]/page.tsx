import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { loadOrNotFound } from "@/lib/auth/session";
import type { Experience } from "@/lib/cms/types";
import { ExperienceForm } from "../experience-form";

export const metadata: Metadata = { title: "Edit role" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const a = await loadOrNotFound<Experience>("experiences", (await params).id);
  return (
    <>
      <PageHeader
        title={`${a.role} at ${a.company}`}
        back={{ href: "/admin/experience", label: "Experience" }}
        actions={<DeleteButton endpoint={`experiences/${a.id}`} itemLabel={`${a.role} at ${a.company}`} redirectTo="/admin/experience" />}
      />
      <ExperienceForm experience={a} />
    </>
  );
}
