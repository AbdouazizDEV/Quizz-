import type { ProfileGender } from '@app-types/profile.types';

import {
  buildDefaultAvatarUrl,
  isBrokenDicebearAvatarUrl,
  normalizeProfileGender,
} from './defaultAvatarUrl';

export { buildDefaultAvatarUrl, normalizeProfileGender };

export function getUserAvatarUri(
  userId: string,
  avatarUrl?: string | null,
  gender: ProfileGender = 'unknown',
): string {
  const clean = avatarUrl?.trim();
  if (clean && !isBrokenDicebearAvatarUrl(clean)) {
    return clean;
  }
  return buildDefaultAvatarUrl(userId, gender);
}

export function resolveProfileGender(...candidates: unknown[]): ProfileGender {
  for (const value of candidates) {
    const normalized = normalizeProfileGender(value);
    if (normalized !== 'unknown') return normalized;
  }
  return 'unknown';
}
