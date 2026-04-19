import { createHmac, timingSafeEqual } from 'node:crypto';

import type { Env } from './env.js';

const SEP = '.';

/** Jeton court durée après verify-otp (HMAC). */
export function signResetToken(userId: string, secret: Env['RESET_TOKEN_SECRET'], ttlMs = 15 * 60 * 1000): string {
  const exp = Date.now() + ttlMs;
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp }), 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}${SEP}${sig}`;
}

export function verifyResetToken(
  token: string,
  secret: Env['RESET_TOKEN_SECRET'],
): { sub: string } | null {
  const i = token.lastIndexOf(SEP);
  if (i <= 0) return null;
  const payload = token.slice(0, i);
  const sig = token.slice(i + SEP.length);
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  try {
    if (!timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'))) return null;
  } catch {
    return null;
  }
  try {
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { sub?: string; exp?: number };
    if (!json.sub || typeof json.exp !== 'number') return null;
    if (Date.now() > json.exp) return null;
    return { sub: json.sub };
  } catch {
    return null;
  }
}
