"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MediaRef } from "@/lib/cms/types";

interface CmsImageProps {
  media: MediaRef | null | undefined;
  className?: string;
  /** Shown when there is no image or it fails to load (e.g. an expired external URL). */
  fallback?: React.ReactNode;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Renders CMS media. Uses a plain <img> because media can live on any HTTPS
 * host (S3/CloudFront or external), which next/image would need allow-listed.
 */
export function CmsImage({ media, className, fallback = null, alt, width, height, priority }: CmsImageProps) {
  const [failed, setFailed] = useState(false);
  if (!media?.url || failed) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.url}
      alt={alt ?? media.alt}
      width={width ?? media.width ?? undefined}
      height={height ?? media.height ?? undefined}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      // Server-rendered images can fail before hydration attaches onError; catch those on mount.
      ref={(el) => {
        if (el?.complete && el.naturalWidth === 0) setFailed(true);
      }}
      className={cn(className)}
    />
  );
}

/** Neutral placeholder with initials, used as a CmsImage fallback. */
export function Initials({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gray-100 font-mono text-xs font-medium text-gray-500 dark:bg-neutral-800 dark:text-neutral-400",
        className,
      )}
    >
      {initials || "•"}
    </span>
  );
}
