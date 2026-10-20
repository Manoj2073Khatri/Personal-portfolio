import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { ExperienceForm } from "../experience-form";

export const metadata: Metadata = { title: "New role" };

export default function NewPage() {
  return (
    <>
      <PageHeader title="New role" back={{ href: "/admin/experience", label: "Experience" }} />
      <ExperienceForm />
    </>
  );
}
