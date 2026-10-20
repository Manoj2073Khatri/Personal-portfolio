"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminApi, errorMessage } from "@/lib/admin/api-client";
import type { ContactSubmission, SubmissionStatus } from "@/lib/cms/types";

/** Marks a new message as read when opened, and offers archive/unread. */
export function MessageActions({ message }: { message: ContactSubmission }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const marked = useRef(false);

  const setStatus = async (status: SubmissionStatus) => {
    setError(null);
    try {
      await adminApi.patch(`contact-submissions/${message.id}`, { status });
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  useEffect(() => {
    if (message.status === "NEW" && !marked.current) {
      marked.current = true;
      void setStatus("READ");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.id, message.status]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild size="sm">
        <a href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your message")}`}>Reply by email</a>
      </Button>
      {message.status !== "ARCHIVED" ? (
        <Button variant="outline" size="sm" onClick={() => setStatus("ARCHIVED")}>Archive</Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setStatus("READ")}>Move to inbox</Button>
      )}
      {message.status !== "NEW" && (
        <Button variant="ghost" size="sm" onClick={() => { marked.current = true; void setStatus("NEW"); }}>Mark as unread</Button>
      )}
      {error && <span role="alert" className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
