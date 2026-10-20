import { BadRequestException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(input: string): string {
  const slug = input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  if (!slug)
    throw new BadRequestException(
      'Unable to derive a slug; provide one explicitly',
    );
  return slug;
}

/** Average adult reading speed; Markdown syntax is stripped roughly first. */
export function readingTimeMinutes(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~[\]()!-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/**
 * Keeps `publishedAt` in step with status: stamped on first publish,
 * preserved on later edits, and left untouched for drafts.
 */
export function resolvePublishedAt(
  status: ContentStatus | undefined,
  current: Date | null | undefined,
  explicit?: Date | null,
): Date | null | undefined {
  if (explicit !== undefined) return explicit;
  if (status === ContentStatus.PUBLISHED && !current) return new Date();
  return undefined;
}

/** Removes `undefined` keys so Prisma `update` leaves those columns alone. */
export function definedOnly<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

export function assertDateRange(start?: Date | null, end?: Date | null) {
  if (start && end && end < start) {
    throw new BadRequestException('endDate must be on or after startDate');
  }
}

export const unique = <T>(items: T[]): T[] => [...new Set(items)];

/**
 * Slug history for SEO: when a record that has been public changes slug, the
 * old slug is kept so links to it can 301 to the new one. Returns undefined
 * when nothing changes.
 */
export function nextPreviousSlugs(
  current: { slug: string; publishedAt: Date | null; previousSlugs: string[] },
  newSlug: string | undefined,
): string[] | undefined {
  if (!newSlug || newSlug === current.slug) return undefined;
  const history = current.publishedAt
    ? [...current.previousSlugs, current.slug]
    : current.previousSlugs;
  return unique(history.filter((s) => s !== newSlug)).slice(-20);
}
