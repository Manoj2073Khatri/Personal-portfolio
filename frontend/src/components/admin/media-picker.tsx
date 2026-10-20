"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, FileText, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { adminApi, errorMessage } from "@/lib/admin/api-client";
import type { Media, MediaKind, MediaRef, Paginated } from "@/lib/cms/types";
import { MediaGridSkeleton } from "./skeletons";
import { UploadPanel } from "./upload-panel";

function Thumb({ media, className = "size-20" }: { media: MediaRef; className?: string }) {
  if (media.kind === "DOCUMENT") {
    return (
      <span className={`${className} flex items-center justify-center rounded-md border bg-muted`}>
        <FileText className="size-6 text-muted-foreground" />
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={media.url} alt={media.alt} referrerPolicy="no-referrer" className={`${className} rounded-md border bg-muted object-cover`} />;
}

/** Library grid inside the dialog; mounted only while the dialog is open. */
function MediaBrowser({ kind, onChoose }: { kind: MediaKind; onChoose: (media: MediaRef) => void }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const key = `${kind}|${page}|${q.trim()}`;
  const [result, setResult] = useState<{ key: string; items: Media[]; totalPages: number; error?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ kind, status: "READY", page: String(page), limit: "18" });
    if (q.trim()) params.set("q", q.trim());
    adminApi
      .get<Paginated<Media>>(`media?${params}`)
      .then((res) => !cancelled && setResult({ key, items: res.data, totalPages: res.meta.totalPages }))
      .catch((e) => !cancelled && setResult({ key, items: [], totalPages: 1, error: errorMessage(e) }));
    return () => {
      cancelled = true;
    };
  }, [key, kind, page, q]);

  const loading = result?.key !== key;
  const items = result?.items ?? [];
  const totalPages = result?.totalPages ?? 1;

  return (
    <>
      <UploadPanel kind={kind} onAdded={onChoose} />
      <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by filename or alt text" aria-label="Search media" />
      {result?.error && <p role="alert" className="text-sm text-destructive">{result.error}</p>}
      {loading ? (
        <MediaGridSkeleton count={12} />
      ) : items.length ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {items.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => onChoose(m)} className="group block w-full rounded-md text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden" title={m.alt || m.filename}>
                <Thumb media={m} className="aspect-square w-full" />
                <span className="mt-1 block truncate text-[11px] text-muted-foreground group-hover:text-foreground">{m.alt || m.filename}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No media found.</p>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ArrowLeft /> Previous
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next <ArrowRight />
          </Button>
        </div>
      )}
    </>
  );
}

/** Dialog to choose existing media or add new. */
function MediaDialog({
  open,
  onOpenChange,
  kind,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: MediaKind;
  onSelect: (media: MediaRef) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{kind === "IMAGE" ? "Choose an image" : "Choose a document"}</DialogTitle>
          <DialogDescription>Pick from the media library or add a new file.</DialogDescription>
        </DialogHeader>
        <MediaBrowser
          kind={kind}
          onChoose={(media) => {
            onSelect(media);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

/** Single media field with preview, change and remove. */
export function MediaPicker({
  value,
  onChange,
  kind = "IMAGE",
}: {
  value: MediaRef | null;
  onChange: (media: MediaRef | null) => void;
  kind?: MediaKind;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-3">
      {value ? <Thumb media={value} /> : <span className="flex size-20 items-center justify-center rounded-md border border-dashed text-muted-foreground"><ImagePlus className="size-5" /></span>}
      <div className="flex flex-col gap-1.5">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {value ? "Change" : kind === "IMAGE" ? "Choose image" : "Choose file"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        )}
      </div>
      <MediaDialog open={open} onOpenChange={setOpen} kind={kind} onSelect={onChange} />
    </div>
  );
}

/** Ordered list of images (project gallery). */
export function GalleryPicker({ value, onChange }: { value: MediaRef[]; onChange: (value: MediaRef[]) => void }) {
  const [open, setOpen] = useState(false);
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };
  return (
    <div className="grid gap-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((m, i) => (
            <li key={m.id} className="relative">
              <Thumb media={m} className="size-24" />
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <Button type="button" size="icon" variant="secondary" className="size-6" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move left">
                  <ArrowLeft className="size-3" />
                </Button>
                <Button type="button" size="icon" variant="secondary" className="size-6" onClick={() => onChange(value.filter((x) => x.id !== m.id))} aria-label="Remove from gallery">
                  <X className="size-3" />
                </Button>
                <Button type="button" size="icon" variant="secondary" className="size-6" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Move right">
                  <ArrowRight className="size-3" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setOpen(true)} disabled={value.length >= 20}>
        <ImagePlus /> Add image
      </Button>
      <MediaDialog
        open={open}
        onOpenChange={setOpen}
        kind="IMAGE"
        onSelect={(m) => !value.some((x) => x.id === m.id) && onChange([...value, m])}
      />
    </div>
  );
}
