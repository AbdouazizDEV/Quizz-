import { apiClient } from '@services/api/apiClient';
import { useAuthStore } from '@stores/authStore';

export interface FriendRequestItem {
  notificationId: string;
  requesterId: string;
  requesterName: string;
  requesterHandle: string;
  requesterAvatarUrl?: string;
  createdAt: string;
}

interface ApiFriendRequestItem {
  notification_id: string;
  requester_id: string;
  requester_name: string;
  requester_handle: string;
  requester_avatar_url: string | null;
  created_at: string;
}

interface ApiFriendRequestsResponse {
  items?: ApiFriendRequestItem[];
  total?: number;
}

function authHeaders(): { Authorization: string } {
  const token = useAuthStore.getState().token?.trim();
  if (!token) throw new Error('Utilisateur non connecté.');
  return { Authorization: `Bearer ${token}` };
}

export async function fetchFriendRequests(limit = 20): Promise<FriendRequestItem[]> {
  const { data } = await apiClient.get<ApiFriendRequestsResponse>('/network/friend-requests', {
    params: { limit },
    headers: authHeaders(),
  });
  return (
    data.items?.map((row) => ({
      notificationId: row.notification_id,
      requesterId: row.requester_id,
      requesterName: row.requester_name?.trim() || 'Joueur',
      requesterHandle: row.requester_handle?.trim() || '@joueur',
      requesterAvatarUrl: row.requester_avatar_url ?? undefined,
      createdAt: row.created_at,
    })) ?? []
  );
}

export async function acceptFriendRequest(notificationId: string): Promise<void> {
  await apiClient.post(
    `/network/friend-requests/${encodeURIComponent(notificationId)}/accept`,
    {},
    { headers: authHeaders() },
  );
}

export async function rejectFriendRequest(notificationId: string): Promise<void> {
  await apiClient.post(
    `/network/friend-requests/${encodeURIComponent(notificationId)}/reject`,
    {},
    { headers: authHeaders() },
  );
}

