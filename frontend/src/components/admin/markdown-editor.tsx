"use client";

import { useState } from "react";
import { Markdown } from "@/components/site/markdown";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Plain Markdown textarea with a live preview rendered by the same component
 * the public site uses, so what you preview is what visitors see.
 */
export function MarkdownEditor({
  id,
  value,
  onChange,
  rows = 16,
  variant = "article",
  ...aria
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  variant?: "article" | "compact";
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const tabClass = (active: boolean) =>
    cn("rounded-md px-2.5 py-1 text-xs font-medium", active ? "bg-background shadow-xs" : "text-muted-foreground hover:text-foreground");

  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/50 px-2 py-1.5">
        <div role="tablist" className="flex gap-1 rounded-lg bg-muted p-0.5">
          <button type="button" role="tab" aria-selected={tab === "write"} className={tabClass(tab === "write")} onClick={() => setTab("write")}>
            Write
          </button>
          <button type="button" role="tab" aria-selected={tab === "preview"} className={tabClass(tab === "preview")} onClick={() => setTab("preview")}>
            Preview
          </button>
        </div>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Markdown: **bold**, _italic_, [link](https://…), ## heading, ```code```
        </span>
      </div>
      {tab === "write" ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="min-h-48 rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
          {...aria}
        />
      ) : (
        <div className="min-h-48 px-4 py-3">
          {value.trim() ? <Markdown variant={variant}>{value}</Markdown> : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
        </div>
      )}
    </div>
  );
}
