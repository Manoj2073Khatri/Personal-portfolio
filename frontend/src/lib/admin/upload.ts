"use client";

import type { Media, MediaKind } from "@/lib/cms/types";
import { adminApi } from "./api-client";

/** Mirrors backend/src/modules/media/media.constants.ts; the server re-validates. */
export const ACCEPT: Record<MediaKind, string[]> = {
  IMAGE: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
  DOCUMENT: ["application/pdf"],
};
export const MAX_BYTES: Record<MediaKind, number> = { IMAGE: 10 * 1024 * 1024, DOCUMENT: 20 * 1024 * 1024 };

interface UploadIntent {
  media: Media;
  uploadUrl: string;
  fields: Record<string, string>;
}

async function imageSize(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) return {};
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return {};
  }
}

/**
 * 1. ask the API for a presigned POST (it validates type/size and picks the key),
 * 2. upload the file straight to S3, 3. ask the API to verify and mark it ready.
 */
export async function uploadMedia(file: File, kind: MediaKind, alt = ""): Promise<Media> {
  if (!ACCEPT[kind].includes(file.type)) throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  if (file.size > MAX_BYTES[kind]) throw new Error(`File is larger than ${MAX_BYTES[kind] / 1024 / 1024} MB`);

  const intent = await adminApi.post<UploadIntent>("media/uploads", {
    filename: file.name.slice(0, 200),
    mimeType: file.type,
    size: file.size,
    alt,
    ...(await imageSize(file)),
  });

  const form = new FormData();
  for (const [key, value] of Object.entries(intent.fields)) form.append(key, value);
  form.append("file", file);
  const res = await fetch(intent.uploadUrl, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload to storage failed (${res.status})`);

  return adminApi.post<Media>(`media/${intent.media.id}/confirm`);
}
