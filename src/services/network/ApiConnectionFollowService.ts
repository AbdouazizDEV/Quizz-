import { apiClient } from '@services/api/apiClient';
import { useAuthStore } from '@stores/authStore';

import type { IConnectionFollowService } from './IConnectionFollowService';

export class ApiConnectionFollowService implements IConnectionFollowService {
  async setFollowing(userId: string, follow: boolean): Promise<void> {
    const token = useAuthStore.getState().token?.trim();
    if (!token) {
      throw new Error('Utilisateur non connecté.');
    }
    if (!userId.trim()) {
      throw new Error('ID utilisateur invalide.');
    }

    if (follow) {
      await apiClient.post(
        `/network/follow/${encodeURIComponent(userId)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return;
    }

    await apiClient.delete(`/network/follow/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

