import { Request } from 'express';
import { hashIp, isTrustedServerRequest, resolveClientIp } from './client-ip';

const KEY = 'k'.repeat(40);

function req(headers: Record<string, string>, ip = '10.0.0.1'): Request {
  return { headers, ip } as unknown as Request;
}

describe('client IP resolution', () => {
  it('ignores the forwarded IP header without the internal key', () => {
    const r = req({ 'x-client-ip': '1.2.3.4' });
    expect(isTrustedServerRequest(r, KEY)).toBe(false);
    expect(resolveClientIp(r, KEY)).toBe('10.0.0.1');
  });

  it('ignores the header when the key is wrong or unset', () => {
    expect(
      resolveClientIp(
        req({ 'x-internal-api-key': 'nope', 'x-client-ip': '1.2.3.4' }),
        KEY,
      ),
    ).toBe('10.0.0.1');
    expect(
      resolveClientIp(
        req({ 'x-internal-api-key': KEY, 'x-client-ip': '1.2.3.4' }),
        undefined,
      ),
    ).toBe('10.0.0.1');
  });

  it('trusts the forwarded IP from the Next.js server', () => {
    expect(
      resolveClientIp(
        req({ 'x-internal-api-key': KEY, 'x-client-ip': '1.2.3.4' }),
        KEY,
      ),
    ).toBe('1.2.3.4');
  });

  it('rejects malformed forwarded IPs', () => {
    expect(
      resolveClientIp(
        req({ 'x-internal-api-key': KEY, 'x-client-ip': 'not-an-ip' }),
        KEY,
      ),
    ).toBeUndefined();
  });

  it('hashes IPs with a salt and never returns them raw', () => {
    const hash = hashIp('1.2.3.4', 'salt');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toEqual(hashIp('1.2.3.4', 'other-salt'));
    expect(hashIp(undefined, 'salt')).toBeNull();
  });
});
