import { apiClient } from '@services/api/apiClient';
import type { GlobalLeaderboardPayload, LeaderboardItem } from '@app-types/leaderboard.types';
import { getUserAvatarUri } from '@utils/getUserAvatarUri';

interface ApiLeaderboardItem {
  id: string;
  display_name: string;
  avatar_url: string | null;
  score: number;
  rank: number;
}

interface ApiLeaderboardResponse {
  items?: ApiLeaderboardItem[];
  me?: { user_id: string; rank: number | null } | null;
}

export async function fetchGlobalLeaderboard(
  limit: number,
  token?: string | null,
): Promise<GlobalLeaderboardPayload> {
  const { data } = await apiClient.get<ApiLeaderboardResponse>('/leaderboard/players', {
    params: { limit },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const items: LeaderboardItem[] =
    data.items?.map((row) => ({
      id: row.id,
      displayName: row.display_name?.trim() || 'Joueur',
      avatarUrl: getUserAvatarUri(row.id, row.avatar_url),
      score: Number.isFinite(row.score) ? row.score : 0,
      rank: Number.isFinite(row.rank) ? row.rank : 0,
    })) ?? [];

  return {
    items,
    me: data.me ? { userId: data.me.user_id, rank: data.me.rank } : null,
  };
}

