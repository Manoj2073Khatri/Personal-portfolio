import { Badge } from "@/components/ui/badge";
import type { ContentStatus, SubmissionStatus } from "@/lib/cms/types";

const VARIANT = {
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "secondary",
  NEW: "warning",
  READ: "secondary",
} as const;

const LABEL: Record<ContentStatus | SubmissionStatus, string> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
  NEW: "New",
  READ: "Read",
};

export function StatusBadge({ status, scheduled }: { status: ContentStatus | SubmissionStatus; scheduled?: boolean }) {
  if (status === "PUBLISHED" && scheduled) return <Badge variant="outline">Scheduled</Badge>;
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
