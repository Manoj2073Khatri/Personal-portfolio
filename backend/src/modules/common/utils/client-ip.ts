import { createHash, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { Request } from 'express';

export const INTERNAL_KEY_HEADER = 'x-internal-api-key';
export const CLIENT_IP_HEADER = 'x-client-ip';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** True when the request carries the shared key that only the Next.js server holds. */
export function isTrustedServerRequest(
  req: Request,
  internalApiKey?: string,
): boolean {
  const provided = req.headers[INTERNAL_KEY_HEADER];
  return (
    !!internalApiKey &&
    typeof provided === 'string' &&
    safeEqual(provided, internalApiKey)
  );
}

/**
 * Resolves the end-user IP. The forwarded client IP header is honoured only
 * from the trusted Next.js server; otherwise Express's `req.ip` is used
 * (which respects the TRUST_PROXY setting).
 */
export function resolveClientIp(
  req: Request,
  internalApiKey?: string,
): string | undefined {
  if (isTrustedServerRequest(req, internalApiKey)) {
    const forwarded = req.headers[CLIENT_IP_HEADER];
    if (typeof forwarded === 'string' && isIP(forwarded.trim()))
      return forwarded.trim();
    return undefined;
  }
  return req.ip;
}

export function hashIp(ip: string | undefined, salt: string): string | null {
  if (!ip) return null;
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}
