import { MediaKind } from '@prisma/client';

/**
 * Allowlisted upload types. SVG is excluded on purpose: it can carry script and
 * would be served as-is from the bucket/CDN.
 */
export const MEDIA_TYPES: Record<string, { kind: MediaKind; ext: string }> = {
  'image/jpeg': { kind: MediaKind.IMAGE, ext: 'jpg' },
  'image/png': { kind: MediaKind.IMAGE, ext: 'png' },
  'image/webp': { kind: MediaKind.IMAGE, ext: 'webp' },
  'image/avif': { kind: MediaKind.IMAGE, ext: 'avif' },
  'image/gif': { kind: MediaKind.IMAGE, ext: 'gif' },
  'application/pdf': { kind: MediaKind.DOCUMENT, ext: 'pdf' },
};

export const ALLOWED_MIME_TYPES = Object.keys(MEDIA_TYPES);

export const MAX_BYTES: Record<MediaKind, number> = {
  [MediaKind.IMAGE]: 10 * 1024 * 1024,
  [MediaKind.DOCUMENT]: 20 * 1024 * 1024,
};
