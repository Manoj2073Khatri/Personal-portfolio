import type { Metadata } from "next";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { loadOrNotFound } from "@/lib/auth/session";
import type { ContactSubmission } from "@/lib/cms/types";
import { MessageActions } from "./message-actions";

export const metadata: Metadata = { title: "Message" };

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const message = await loadOrNotFound<ContactSubmission>("contact-submissions", (await params).id);
  return (
    <>
      <PageHeader
        title={message.name}
        description={message.email}
        back={{ href: "/admin/messages", label: "Messages" }}
        actions={<DeleteButton endpoint={`contact-submissions/${message.id}`} itemLabel="this message" redirectTo="/admin/messages" />}
      />
      <article className="rounded-xl border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <StatusBadge status={message.status} />
          <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString()}</time>
          {message.userAgent && <span className="truncate" title={message.userAgent}>{message.userAgent}</span>}
        </div>
        {/* Rendered as text, never HTML: submissions are untrusted input. */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
      </article>
      <div className="mt-4">
        <MessageActions message={message} />
      </div>
    </>
  );
}
