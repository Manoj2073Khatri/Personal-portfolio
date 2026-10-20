import "server-only";
import { cmsApiUrl, internalHeaders } from "@/lib/cms/config";
import type { AuthUser } from "@/lib/cms/types";

/**
 * Session tokens live in httpOnly cookies on the frontend origin (ADR 0002).
 * `__Host-` prefixed names require HTTPS, so plain names are used in development.
 */
const secure = process.env.NODE_ENV === "production";
export const ACCESS_COOKIE = secure ? "__Host-cms_at" : "cms_at";
export const REFRESH_COOKIE = secure ? "__Host-cms_rt" : "cms_rt";

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  user: AuthUser;
}

export interface CookieWriter {
  set(name: string, value: string, options: Record<string, unknown>): unknown;
  delete(name: string): unknown;
}

const baseCookie = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };

export function writeSessionCookies(cookies: CookieWriter, tokens: TokenResponse) {
  cookies.set(ACCESS_COOKIE, tokens.accessToken, { ...baseCookie, maxAge: tokens.accessTokenExpiresIn });
  cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...baseCookie, maxAge: tokens.refreshTokenExpiresIn });
}

export function clearSessionCookies(cookies: CookieWriter) {
  cookies.delete(ACCESS_COOKIE);
  cookies.delete(REFRESH_COOKIE);
}

/** Reads `exp` without verifying the signature; the API verifies every request. */
export function isExpiringSoon(token: string | undefined, skewSeconds = 30): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()) as { exp?: number };
    return !payload.exp || payload.exp * 1000 < Date.now() + skewSeconds * 1000;
  } catch {
    return true;
  }
}

export async function requestRefresh(refreshToken: string, clientIp?: string | null): Promise<TokenResponse | null> {
  try {
    const res = await fetch(`${cmsApiUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json", ...internalHeaders(clientIp) },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as TokenResponse) : null;
  } catch {
    return null;
  }
}

/** First hop of X-Forwarded-For (set by Vercel / the reverse proxy), else X-Real-IP. */
export function clientIpFrom(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || null;
}
