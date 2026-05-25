import { apiClient } from '@services/api/apiClient';
import { useAuthStore } from '@stores/authStore';
import type { AppNotification, NotificationFilter, NotificationsPage } from '@app-types/notification.types';

import type { INotificationsPort } from './INotificationsPort';

interface ApiNotificationRow {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  data?: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

interface ApiNotificationsResponse {
  items?: ApiNotificationRow[];
  page?: number;
  limit?: number;
  total?: number;
  unread_count?: number;
}

function authHeaders(): { Authorization: string } {
  const token = useAuthStore.getState().token?.trim();
  if (!token) throw new Error('Utilisateur non connecté.');
  return { Authorization: `Bearer ${token}` };
}

function mapRow(row: ApiNotificationRow): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title?.trim() || 'Notification',
    body: row.body?.trim() || null,
    data: (row.data && typeof row.data === 'object' ? row.data : {}) as Record<string, unknown>,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

export class ApiNotificationsProvider implements INotificationsPort {
  async list(params: {
    filter: NotificationFilter;
    page: number;
    limit?: number;
  }): Promise<NotificationsPage> {
    const limit = params.limit ?? 30;
    const { data } = await apiClient.get<ApiNotificationsResponse>('/notifications', {
      params: { filter: params.filter, page: params.page, limit },
      headers: authHeaders(),
    });

    return {
      items: (data.items ?? []).map(mapRow),
      page: data.page ?? params.page,
      limit: data.limit ?? limit,
      total: data.total ?? 0,
      unreadCount: data.unread_count ?? 0,
    };
  }

  async markRead(notificationId: string): Promise<void> {
    await apiClient.patch(
      `/notifications/${encodeURIComponent(notificationId)}/read`,
      {},
      { headers: authHeaders() },
    );
  }

  async markAllRead(): Promise<void> {
    await apiClient.post('/notifications/read-all', {}, { headers: authHeaders() });
  }

  async remove(notificationId: string): Promise<void> {
    await apiClient.delete(`/notifications/${encodeURIComponent(notificationId)}`, {
      headers: authHeaders(),
    });
  }
}
