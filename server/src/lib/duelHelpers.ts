export const DUEL_ACCEPTANCE_MS = 30 * 60 * 1000;

export function duelExpiresAtIso(from = Date.now()): string {
  return new Date(from + DUEL_ACCEPTANCE_MS).toISOString();
}

export function isDuelPastExpiry(expiresAt: string, now = Date.now()): boolean {
  return new Date(expiresAt).getTime() <= now;
}

export type DuelDbStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'expired';

export function shouldAutoExpireStatus(status: string): boolean {
  return status === 'pending' || status === 'accepted';
}
