import type { ProfileGender } from '@app-types/profile.types';

/** Dicebear 7.x refuse les listes `top=a,b` dans l’URL (HTTP 400). */
export function isBrokenDicebearAvatarUrl(url: string): boolean {
  return /dicebear\.com/i.test(url) && /[?&]top=[^&]*,/.test(url);
}

/** Avatar Dicebear par défaut, adapté au genre choisi à l'inscription. */
export function buildDefaultAvatarUrl(userId: string, gender: ProfileGender = 'unknown'): string {
  const seed = encodeURIComponent(userId.trim() || 'joueur');

  if (gender === 'female') {
    return `https://api.dicebear.com/7.x/lorelei/png?seed=${seed}`;
  }

  if (gender === 'male') {
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&facialHairProbability=80`;
  }

  return `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}`;
}

export function normalizeProfileGender(value: unknown): ProfileGender {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (['female', 'f', 'femme', 'woman'].includes(raw)) return 'female';
  if (['male', 'm', 'homme', 'man'].includes(raw)) return 'male';
  return 'unknown';
}
