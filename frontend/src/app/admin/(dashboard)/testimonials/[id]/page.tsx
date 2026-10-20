import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { loadOrNotFound } from "@/lib/auth/session";
import type { Testimonial } from "@/lib/cms/types";
import { TestimonialForm } from "../testimonial-form";

export const metadata: Metadata = { title: "Edit testimonial" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const a = await loadOrNotFound<Testimonial>("testimonials", (await params).id);
  return (
    <>
      <PageHeader
        title={`testimonial from ${a.authorName}`}
        back={{ href: "/admin/testimonials", label: "Testimonials" }}
        actions={<DeleteButton endpoint={`testimonials/${a.id}`} itemLabel={`testimonial from ${a.authorName}`} redirectTo="/admin/testimonials" />}
      />
      <TestimonialForm testimonial={a} />
    </>
  );
}
