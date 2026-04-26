import type { ConnectionFilter, ConnectionsScreenData } from '@app-types/network.types';
import { apiClient } from '@services/api/apiClient';
import { useAuthStore } from '@stores/authStore';
import { getUserAvatarUri } from '@utils/getUserAvatarUri';

import type { IConnectionsDataProvider } from './IConnectionsDataProvider';

interface ApiConnectionUser {
  id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  relationship_is_active: boolean;
}

interface ApiConnectionsResponse {
  viewer_display_name?: string;
  items?: ApiConnectionUser[];
  page?: number;
  limit?: number;
  total?: number;
  has_more?: boolean;
}

export class ApiConnectionsDataProvider implements IConnectionsDataProvider {
  async getConnections(params: {
    filter: ConnectionFilter;
    query?: string;
    page: number;
    limit: number;
  }): Promise<ConnectionsScreenData> {
    const token = useAuthStore.getState().token?.trim();
    if (!token) {
      throw new Error('Utilisateur non connecté.');
    }

    const { data } = await apiClient.get<ApiConnectionsResponse>('/network/users', {
      params: {
        filter: params.filter,
        q: params.query?.trim() || undefined,
        page: params.page,
        limit: params.limit,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      viewerDisplayName: data.viewer_display_name?.trim() || 'Mon réseau',
      items:
        data.items?.map((u) => ({
          id: u.id,
          displayName: u.display_name?.trim() || 'Joueur',
          handle: u.handle?.trim() || '@joueur',
          avatarUri: getUserAvatarUri(u.id, u.avatar_url),
          relationshipIsActive: Boolean(u.relationship_is_active),
        })) ?? [],
      page: data.page ?? params.page,
      limit: data.limit ?? params.limit,
      total: data.total ?? 0,
      hasMore: Boolean(data.has_more),
    };
  }
}

