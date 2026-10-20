"use client";

import { useRef, useState } from "react";
import { Link2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi, errorMessage } from "@/lib/admin/api-client";
import { ACCEPT, uploadMedia } from "@/lib/admin/upload";
import type { Media, MediaKind } from "@/lib/cms/types";

/** Upload a file to S3, or register an image already hosted elsewhere. */
export function UploadPanel({ kind, onAdded }: { kind: MediaKind; onAdded: (media: Media) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<"upload" | "url" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy("upload");
    setError(null);
    try {
      onAdded(await uploadMedia(file, kind, alt));
      setAlt("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onUrl() {
    setBusy("url");
    setError(null);
    try {
      onAdded(await adminApi.post<Media>("media/external", { url: url.trim(), alt }));
      setUrl("");
      setAlt("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-3 rounded-lg border border-dashed p-3">
      <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text (describe the image for screen readers)" maxLength={300} aria-label="Alt text" />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input ref={fileRef} type="file" accept={ACCEPT[kind].join(",")} className="sr-only" id={`upload-${kind}`} onChange={(e) => onFile(e.target.files?.[0])} />
        <Button type="button" variant="secondary" disabled={!!busy} onClick={() => fileRef.current?.click()}>
          <Upload /> {busy === "upload" ? "Uploading…" : kind === "IMAGE" ? "Upload image" : "Upload PDF"}
        </Button>
        {kind === "IMAGE" && (
          <div className="flex flex-1 gap-2">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… existing image URL" type="url" aria-label="Image URL" />
            <Button type="button" variant="outline" disabled={!!busy || !url.trim()} onClick={onUrl}>
              <Link2 /> {busy === "url" ? "Adding…" : "Add URL"}
            </Button>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {kind === "IMAGE" ? "JPEG, PNG, WebP, AVIF or GIF up to 10 MB." : "PDF up to 20 MB."}
      </p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
