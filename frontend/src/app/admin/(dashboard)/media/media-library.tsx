"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Copy, ExternalLink, FileText } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { UploadPanel } from "@/components/admin/upload-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi, errorMessage } from "@/lib/admin/api-client";
import type { Media } from "@/lib/cms/types";

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function AltEditor({ media }: { media: Media }) {
  const router = useRouter();
  const [alt, setAlt] = useState(media.alt);
  const [state, setState] = useState<"idle" | "saving" | "saved" | string>("idle");
  const save = async () => {
    if (alt === media.alt) return;
    setState("saving");
    try {
      await adminApi.patch(`media/${media.id}`, { alt });
      setState("saved");
      router.refresh();
    } catch (e) {
      setState(errorMessage(e));
    }
  };
  return (
    <div className="grid gap-1">
      <Input value={alt} onChange={(e) => { setAlt(e.target.value); setState("idle"); }} onBlur={save} onKeyDown={(e) => e.key === "Enter" && save()} placeholder="Alt text" maxLength={300} aria-label={`Alt text for ${media.filename}`} className="h-8 text-xs" />
      {state === "saved" && <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Saved</span>}
      {state !== "idle" && state !== "saving" && state !== "saved" && <span className="text-[11px] text-destructive">{state}</span>}
    </div>
  );
}

function CopyUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Copy URL"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  );
}

export function MediaLibrary({ items, kind }: { items: Media[]; kind: "IMAGE" | "DOCUMENT" }) {
  const router = useRouter();
  return (
    <div className="grid gap-6">
      <UploadPanel kind={kind} onAdded={() => router.refresh()} />
      {items.length ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-xl border bg-card">
              <div className="flex aspect-video items-center justify-center bg-muted">
                {m.kind === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt={m.alt} referrerPolicy="no-referrer" loading="lazy" className="size-full object-contain" />
                ) : (
                  <FileText className="size-10 text-muted-foreground" />
                )}
              </div>
              <div className="grid gap-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium" title={m.filename}>{m.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {[m.mimeType.replace(/^(image|application)\//, "").toUpperCase(), formatBytes(m.size), m.width && m.height ? `${m.width}×${m.height}` : ""].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {m.external && <Badge variant="outline">External</Badge>}
                    {m.status === "PENDING" && <Badge variant="warning">Pending</Badge>}
                  </div>
                </div>
                <AltEditor media={m} />
                <div className="flex items-center justify-end gap-1">
                  <CopyUrl url={m.url} />
                  <Button asChild variant="ghost" size="icon" aria-label="Open file">
                    <a href={m.url} target="_blank" rel="noopener noreferrer"><ExternalLink /></a>
                  </Button>
                  <DeleteButton endpoint={`media/${m.id}`} itemLabel={`“${m.filename}”`} iconOnly />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No files here yet. Upload one above.</p>
      )}
    </div>
  );
}
