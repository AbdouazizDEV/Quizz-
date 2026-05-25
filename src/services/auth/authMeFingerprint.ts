import type { AuthMeResponse } from '@sdk';

function readUpdatedAt(value: unknown): string {
  if (value && typeof value === 'object' && 'updated_at' in value) {
    const raw = (value as { updated_at?: unknown }).updated_at;
    return typeof raw === 'string' ? raw : '';
  }
  return '';
}

/** Empreinte pour détecter un changement côté serveur (user + profile). */
export function getAuthMeFingerprint(me: AuthMeResponse): string {
  const userUpdated = readUpdatedAt(me.user);
  const profileUpdated = readUpdatedAt(me.profile);
  const profileScore = me.profile?.total_score ?? 0;
  const profileQuizzes = me.profile?.quizzes_completed ?? 0;
  return `${userUpdated}|${profileUpdated}|${profileScore}|${profileQuizzes}`;
}
