import type { AuthMeResponse } from '@sdk';
import type { components } from '@sdk';

type AuthUser = components['schemas']['AuthUser'];

function readNumber(...candidates: unknown[]): number {
  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
  }
  return 0;
}

/** Préremplit le cache `auth/me` depuis la réponse login (avant le GET /auth/me complet). */
export function mapLoginUserToAuthMe(user: AuthUser): AuthMeResponse {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const userRecord = user as Record<string, unknown>;
  const userId = user.id ?? '';

  return {
    user,
    profile: {
      id: userId,
      username: String(meta.username ?? '').trim() || 'Joueur',
      full_name: typeof meta.full_name === 'string' ? meta.full_name : null,
      avatar_url: typeof meta.avatar_url === 'string' ? meta.avatar_url.trim() || null : null,
      level_code: typeof meta.level_code === 'string' ? meta.level_code : 'Z0',
      // Ne jamais forcer 0 si le backend / metadata expose déjà le score.
      total_score: readNumber(meta.total_score, userRecord.total_score),
      quizzes_completed: readNumber(meta.quizzes_completed, userRecord.quizzes_completed),
      days_active: readNumber(meta.days_active, userRecord.days_active),
      streak_days: readNumber(meta.streak_days, userRecord.streak_days),
      is_premium: meta.is_premium === true || userRecord.is_premium === true,
    },
  };
}
