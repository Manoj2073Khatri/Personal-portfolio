import "server-only";

/** Server-only configuration. Never import this from a client component. */
export function cmsApiUrl(): string {
  const url = process.env.CMS_API_URL;
  if (!url) throw new Error("CMS_API_URL is not set (e.g. http://localhost:4000/api/v1)");
  return url.replace(/\/+$/, "");
}

/** Marks requests as coming from this server; enables client-IP rate limiting on the API. */
export function internalHeaders(clientIp?: string | null): Record<string, string> {
  const headers: Record<string, string> = {};
  const key = process.env.INTERNAL_API_KEY;
  if (key) headers["x-internal-api-key"] = key;
  if (key && clientIp) headers["x-client-ip"] = clientIp;
  return headers;
}

/** Cache tag shared by every public CMS fetch; expired after any admin mutation. */
export const CMS_CACHE_TAG = "cms";

/** Upper bound on staleness if an on-demand revalidation is ever missed. */
export const CMS_REVALIDATE_SECONDS = 3600;
