import Link from "next/link";
import type { ContentStatus } from "@/lib/cms/types";

const NOTE: Record<ContentStatus, string> = {
  DRAFT: "This is a draft. Visitors can’t see it until you publish it.",
  PUBLISHED: "This is published. Visitors see the same content.",
  ARCHIVED: "This is archived and hidden from visitors.",
};

export function PreviewBanner({ status, editHref, scheduledFor }: { status: ContentStatus; editHref: string; scheduledFor?: string | null }) {
  const scheduled = status === "PUBLISHED" && scheduledFor && new Date(scheduledFor) > new Date();
  return (
    <div role="note" className="mb-8 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-highlight bg-highlight/15 px-4 py-2.5 text-sm text-gray-800 dark:text-neutral-200">
      <span>
        <strong>Preview.</strong>{" "}
        {scheduled ? `Scheduled — goes live ${new Date(scheduledFor).toLocaleString()}.` : NOTE[status]}
      </span>
      <Link href={editHref} className="font-medium underline underline-offset-4">
        Back to editor
      </Link>
    </div>
  );
}
