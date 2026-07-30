import { apiClient } from '@services/api/apiClient';
import { useAuthStore } from '@stores/authStore';

export interface NotificationPreferenceItem {
  type: string;
  enabled: boolean;
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferenceItem[]> {
  const token = useAuthStore.getState().token?.trim();
  if (!token) return [];
  const { data } = await apiClient.get<{ items: NotificationPreferenceItem[] }>(
    '/notifications/preferences',
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return data.items ?? [];
}

export async function setNotificationPreference(
  type: string,
  enabled: boolean,
): Promise<void> {
  const token = useAuthStore.getState().token?.trim();
  if (!token) throw new Error('Non authentifié');
  await apiClient.put(
    '/notifications/preferences',
    { type, enabled },
    { headers: { Authorization: `Bearer ${token}` } },
  );
}
