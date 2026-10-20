import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clientIpFrom,
  isExpiringSoon,
  requestRefresh,
  writeSessionCookies,
} from "@/lib/auth/tokens";

/**
 * Admin session upkeep. This is an optimistic gate only: real authorization
 * is enforced by the CMS API on every admin call (see docs/architecture.md).
 *
 * - No session at all → redirect /admin pages to /admin/login.
 * - Access token missing or about to expire → rotate it with the refresh
 *   token and expose the new cookies to this request and the browser.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const isApi = pathname.startsWith("/api/admin");
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!isExpiringSoon(access)) {
    return isLogin ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }

  const tokens = refresh ? await requestRefresh(refresh, clientIpFrom(request.headers)) : null;

  if (!tokens) {
    // Concurrent requests race to rotate the same refresh token and only one
    // wins. Losers keep a still-valid access token and never clear cookies,
    // so they cannot wipe the winner's fresh session.
    if (access && !isExpiringSoon(access, 0)) return NextResponse.next();
    if (isLogin) return NextResponse.next();
    return isApi
      ? NextResponse.json({ statusCode: 401, message: "Session expired" }, { status: 401 })
      : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isLogin) {
    const res = NextResponse.redirect(new URL("/admin", request.url));
    writeSessionCookies(res.cookies, tokens);
    return res;
  }

  // Forward the fresh tokens to the route being rendered and to the browser.
  request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
  request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);
  const res = NextResponse.next({ request: { headers: request.headers } });
  writeSessionCookies(res.cookies, tokens);
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
