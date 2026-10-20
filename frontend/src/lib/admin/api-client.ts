"use client";

import { CmsApiError } from "@/lib/cms/errors";

/**
 * Browser-side admin API client. Calls go through the same-origin BFF route
 * (src/app/api/admin/[...path]/route.ts); tokens never reach JavaScript.
 */
async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/admin/${path.replace(/^\/+/, "")}`, {
    method,
    headers: body !== undefined ? { "content-type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });
  if (res.status === 401) {
    // Deliberately a full navigation (not router.push) so src/proxy.ts re-runs for the expired session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/admin/login";
    throw new CmsApiError(401, "Session expired");
  }
  if (!res.ok) throw await CmsApiError.fromResponse(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const adminApi = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: (path: string) => request<void>("DELETE", path),
};

export function errorMessage(error: unknown): string {
  if (error instanceof CmsApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
