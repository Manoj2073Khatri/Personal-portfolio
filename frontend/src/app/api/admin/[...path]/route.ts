import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, clientIpFrom } from "@/lib/auth/tokens";
import { CMS_CACHE_TAG, cmsApiUrl, internalHeaders } from "@/lib/cms/config";

/**
 * Backend-for-frontend proxy: browser → /api/admin/<path> → CMS API
 * /admin/<path>, with the bearer token taken from the httpOnly cookie
 * (ADR 0002). Only `/admin/*` API routes are reachable through it.
 */

const SEGMENT = /^[A-Za-z0-9-]+$/;
const MAX_BODY_BYTES = 1024 * 1024;

type Context = { params: Promise<{ path: string[] }> };

function error(status: number, message: string) {
  return NextResponse.json({ statusCode: status, message }, { status });
}

/** CSRF defence for cookie-authenticated mutations: require a same-origin request. */
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function forward(request: NextRequest, { params }: Context) {
  const { path } = await params;
  if (!path.length || !path.every((s) => SEGMENT.test(s))) return error(400, "Invalid path");

  const mutating = request.method !== "GET";
  if (mutating && !isSameOrigin(request)) return error(403, "Cross-origin request rejected");

  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return error(401, "Not signed in");

  let body: string | undefined;
  if (mutating && request.method !== "DELETE") {
    body = await request.text();
    if (body.length > MAX_BODY_BYTES) return error(413, "Request body too large");
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${cmsApiUrl()}/admin/${path.join("/")}${request.nextUrl.search}`, {
      method: request.method,
      headers: {
        accept: "application/json",
        ...(body ? { "content-type": "application/json" } : {}),
        ...internalHeaders(clientIpFrom(request.headers)),
        authorization: `Bearer ${token}`,
      },
      body,
      cache: "no-store",
    });
  } catch {
    return error(502, "CMS API unreachable");
  }

  // Any successful write may change public content: expire the cached reads now.
  if (mutating && upstream.ok) revalidateTag(CMS_CACHE_TAG, { expire: 0 });

  if (upstream.status === 204) return new NextResponse(null, { status: 204 });
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE };
