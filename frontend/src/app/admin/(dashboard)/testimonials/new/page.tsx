import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { TestimonialForm } from "../testimonial-form";

export const metadata: Metadata = { title: "New testimonial" };

export default function NewPage() {
  return (
    <>
      <PageHeader title="New testimonial" back={{ href: "/admin/testimonials", label: "Testimonials" }} />
      <TestimonialForm />
    </>
  );
}
