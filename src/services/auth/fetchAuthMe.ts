import { apiClient } from '@services/api/apiClient';
import { useAuthStore } from '@stores/authStore';

/** Réponse de `GET /api/v1/auth/me` (profil public + utilisateur Auth). */
export interface AuthMeResponse {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
  profile: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    level_code: string;
    total_score: number;
    quizzes_completed: number;
    days_active: number;
    streak_days: number;
    is_premium: boolean;
  } | null;
}

export async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  const token = useAuthStore.getState().token;
  if (!token?.trim()) return null;
  const { data } = await apiClient.get<AuthMeResponse>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
