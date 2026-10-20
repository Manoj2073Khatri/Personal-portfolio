"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import type { ContentStatus } from "@/lib/cms/types";

/**
 * Sticky save bar. With a status, offers draft/published/archived and a
 * one-click "Save and publish"; preview opens the unpublished render.
 */
export function FormActions({
  status,
  onStatusChange,
  onSave,
  saving,
  dirty,
  savedAt,
  formError,
  previewHref,
  isNew,
}: {
  status?: ContentStatus;
  onStatusChange?: (status: ContentStatus) => void;
  onSave: (overrides?: { status?: ContentStatus }) => void;
  saving: boolean;
  dirty: boolean;
  savedAt: Date | null;
  formError: string | null;
  previewHref?: string;
  isNew?: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5 text-sm" aria-live="polite">
          {formError ? (
            <span className="text-destructive">{formError}</span>
          ) : saving ? (
            <span className="text-muted-foreground">Saving…</span>
          ) : dirty ? (
            <span className="text-muted-foreground">Unsaved changes</span>
          ) : savedAt ? (
            <span className="text-emerald-700 dark:text-emerald-400">Saved at {savedAt.toLocaleTimeString()}</span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status && onStatusChange && (
            <NativeSelect value={status} onChange={(e) => onStatusChange(e.target.value as ContentStatus)} aria-label="Status" className="w-36">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </NativeSelect>
          )}
          {previewHref && !isNew && (
            <Button asChild type="button" variant="outline">
              <Link href={previewHref} target="_blank">
                <Eye /> Preview
              </Link>
            </Button>
          )}
          <Button type="button" variant={status && status !== "PUBLISHED" ? "outline" : "default"} disabled={saving} onClick={() => onSave()}>
            {isNew ? "Create" : "Save"}
          </Button>
          {status && status !== "PUBLISHED" && (
            <Button type="button" disabled={saving} onClick={() => onSave({ status: "PUBLISHED" })}>
              {isNew ? "Create and publish" : "Save and publish"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
