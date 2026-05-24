import { apiClient } from '@services/api/apiClient';
import type { PaginatedResponse } from '@app-types/pagination.types';
import { useAuthStore } from '@stores/authStore';
import { getUserAvatarUri } from '@utils/getUserAvatarUri';

export interface DuelFriendResult {
  id: string;
  displayName: string;
  handle: string;
  avatarUri: string;
}

interface ApiConnectionsResponse {
  items?: {
    id: string;
    display_name: string;
    handle: string;
    avatar_url: string | null;
  }[];
  page?: number;
  limit?: number;
  total?: number;
  has_more?: boolean;
}

function mapFriend(user: NonNullable<ApiConnectionsResponse['items']>[number]): DuelFriendResult {
  return {
    id: user.id,
    displayName: user.display_name?.trim() || 'Joueur',
    handle: user.handle?.trim() || '@joueur',
    avatarUri: getUserAvatarUri(user.id, user.avatar_url),
  };
}

/** Même source que l'écran Réseau → Amis (`/network/users?filter=friends`). */
export async function fetchFriendsForDuelPaginated(
  query: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<DuelFriendResult>> {
  const token = useAuthStore.getState().token?.trim();
  if (!token) {
    throw new Error('Utilisateur non connecté.');
  }

  const q = query.trim();

  const { data } = await apiClient.get<ApiConnectionsResponse>('/network/users', {
    params: {
      filter: 'friends',
      q: q.length > 0 ? q : undefined,
      page,
      limit,
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  const items = data.items?.map(mapFriend) ?? [];

  return {
    items,
    page: data.page ?? page,
    limit: data.limit ?? limit,
    total: data.total ?? items.length,
    hasMore: data.has_more ?? false,
  };
}

/** Aperçu hub — première page avec limite réduite. */
export async function searchFriendsForDuel(query: string, limit = 30): Promise<DuelFriendResult[]> {
  const page = await fetchFriendsForDuelPaginated(query, 1, limit);
  return page.items;
}
