import type { QuizLeaderboardEntry } from '@app-types/quizPlay.types';
import { apiClient } from '@services/api/apiClient';
import type { IQuizLeaderboardPort } from '@services/quiz/leaderboard/IQuizLeaderboardPort';
import { useAuthStore } from '@stores/authStore';
import { getUserAvatarUri } from '@utils/getUserAvatarUri';

interface ApiQuizLeaderboardItem {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  score: number;
  rank: number;
  is_current_user?: boolean;
}

interface ApiQuizLeaderboardResponse {
  items?: ApiQuizLeaderboardItem[];
}

export class ApiQuizLeaderboardAdapter implements IQuizLeaderboardPort {
  async fetchLeaderboardForQuiz(quizId: string, limit = 7): Promise<QuizLeaderboardEntry[]> {
    const token = useAuthStore.getState().token?.trim();
    try {
      const { data } = await apiClient.get<ApiQuizLeaderboardResponse>(
        `/quizzes/${encodeURIComponent(quizId)}/leaderboard`,
        {
          params: { limit },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      return (
        data.items?.map((row) => ({
          rank: row.rank,
          userId: row.user_id,
          displayName: row.display_name?.trim() || 'Joueur',
          score: Number.isFinite(row.score) ? row.score : 0,
          avatarUrl: getUserAvatarUri(row.user_id, row.avatar_url),
          isCurrentUser: Boolean(row.is_current_user),
        })) ?? []
      );
    } catch {
      return [];
    }
  }
}
