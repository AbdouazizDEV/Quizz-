import type { AuthMeResponse } from '@sdk';
import type { components } from '@sdk';

type AuthUser = components['schemas']['AuthUser'];

/** Préremplit le cache `auth/me` depuis la réponse login (avant le GET /auth/me complet). */
export function mapLoginUserToAuthMe(user: AuthUser): AuthMeResponse {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const userId = user.id ?? '';

  return {
    user,
    profile: {
      id: userId,
      username: String(meta.username ?? '').trim() || 'Joueur',
      full_name: typeof meta.full_name === 'string' ? meta.full_name : null,
      avatar_url: null,
      level_code: 'Z0',
      total_score: 0,
      quizzes_completed: 0,
      days_active: 0,
      streak_days: 0,
      is_premium: false,
    },
  };
}
