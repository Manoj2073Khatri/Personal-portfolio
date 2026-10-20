"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cmsApiUrl, internalHeaders } from "@/lib/cms/config";
import {
  ACCESS_COOKIE,
  clearSessionCookies,
  clientIpFrom,
  type TokenResponse,
  writeSessionCookies,
} from "./tokens";

export interface LoginState {
  error?: string;
  email?: string;
}

/** Server Actions are POST-only and origin-checked by Next.js, which covers CSRF here. */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password.", email };

  let res: Response;
  try {
    res = await fetch(`${cmsApiUrl()}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json", ...internalHeaders(clientIpFrom(await headers())) },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return { error: "The CMS API is unreachable. Try again shortly.", email };
  }

  if (res.status === 429) return { error: "Too many attempts. Wait a minute and try again.", email };
  if (!res.ok) return { error: "Invalid email or password.", email };

  writeSessionCookies(await cookies(), (await res.json()) as TokenResponse);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (token) {
    // Revoke the refresh token server-side; cookies are cleared regardless.
    await fetch(`${cmsApiUrl()}/auth/logout`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, ...internalHeaders() },
      cache: "no-store",
    }).catch(() => undefined);
  }
  clearSessionCookies(store);
  redirect("/admin/login");
}
