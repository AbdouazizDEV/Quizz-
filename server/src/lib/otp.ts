import { createHash, randomInt, timingSafeEqual } from 'node:crypto';

import type { Env } from './env.js';

export function generateNumericOtp(length = 6): string {
  const max = 10 ** length;
  return String(randomInt(0, max)).padStart(length, '0');
}

export function hashOtp(code: string, pepper: Env['OTP_PEPPER']): string {
  return createHash('sha256').update(`${pepper}:${code}`, 'utf8').digest('hex');
}

export function safeEqualOtp(provided: string, storedHash: string, pepper: Env['OTP_PEPPER']): boolean {
  const h = hashOtp(provided, pepper);
  try {
    return timingSafeEqual(Buffer.from(h, 'utf8'), Buffer.from(storedHash, 'utf8'));
  } catch {
    return false;
  }
}
