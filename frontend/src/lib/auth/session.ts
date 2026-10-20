import "server-only";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { cmsApiUrl, internalHeaders } from "@/lib/cms/config";
import { CmsApiError } from "@/lib/cms/errors";
import type { AuthUser } from "@/lib/cms/types";
import { ACCESS_COOKIE, clientIpFrom } from "./tokens";

/**
 * Authenticated server-side call to the CMS API, for Server Components and
 * Server Actions. Token refresh happens earlier, in src/proxy.ts, because
 * Server Components cannot write cookies.
 */
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) redirect("/admin/login");

  const res = await fetch(`${cmsApiUrl()}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...internalHeaders(clientIpFrom(await headers())),
      ...init.headers,
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) throw await CmsApiError.fromResponse(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** The signed-in admin, or null. Cached per request. */
export const getCurrentAdmin = cache(async (): Promise<AuthUser | null> => {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  const res = await fetch(`${cmsApiUrl()}/auth/me`, {
    headers: { authorization: `Bearer ${token}`, ...internalHeaders() },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const user = (await res.json()) as AuthUser;
  return user.role === "ADMIN" ? user : null;
});

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Loads `/admin/<collection>/<id>` for edit/preview pages; 404s for bad or unknown ids. */
export async function loadOrNotFound<T>(collection: string, id: string): Promise<T> {
  if (!UUID.test(id)) notFound();
  try {
    return await adminFetch<T>(`/admin/${collection}/${id}`);
  } catch (error) {
    if (error instanceof CmsApiError && error.status === 404) notFound();
    throw error;
  }
}

/** Site name used in SEO previews (matches the public `%s — <name>` title template). */
export async function getSiteNameForAdmin(): Promise<string> {
  const settings = await adminFetch<{ name: string }>("/admin/settings").catch(() => null);
  return settings?.name ?? "";
}
