import { apiClient } from '@services/api/apiClient';
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
}

/** Même source que l'écran Réseau → Amis (`/network/users?filter=friends`). */
export async function searchFriendsForDuel(query: string): Promise<DuelFriendResult[]> {
  const token = useAuthStore.getState().token?.trim();
  if (!token) {
    throw new Error('Utilisateur non connecté.');
  }

  const q = query.trim();

  const { data } = await apiClient.get<ApiConnectionsResponse>('/network/users', {
    params: {
      filter: 'friends',
      q: q.length > 0 ? q : undefined,
      page: 1,
      limit: 30,
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  return (
    data.items?.map((user) => ({
      id: user.id,
      displayName: user.display_name?.trim() || 'Joueur',
      handle: user.handle?.trim() || '@joueur',
      avatarUri: getUserAvatarUri(user.id, user.avatar_url),
    })) ?? []
  );
}
