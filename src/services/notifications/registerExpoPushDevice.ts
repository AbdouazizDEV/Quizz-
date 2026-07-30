import { Platform } from 'react-native';

import { apiClient } from '@services/api/apiClient';
import { useAuthStore } from '@stores/authStore';

/**
 * Enregistre le token Expo Push auprès de l’API.
 * Nécessite `expo-notifications` installé (`npx expo install expo-notifications`).
 * No-op gracieux si le module est absent (web / install manquant).
 */
export async function registerExpoPushDevice(): Promise<{ ok: boolean; reason?: string }> {
  const authToken = useAuthStore.getState().token?.trim();
  if (!authToken) return { ok: false, reason: 'unauthenticated' };
  if (Platform.OS === 'web') return { ok: false, reason: 'web_unsupported' };

  let Notifications: typeof import('expo-notifications') | null = null;
  try {
    // Import dynamique : évite de casser le bundle si le package n’est pas encore installé.
    Notifications = await import('expo-notifications');
  } catch {
    return { ok: false, reason: 'expo_notifications_missing' };
  }

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return { ok: false, reason: 'permission_denied' };

    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenResponse.data;
    if (!expoPushToken) return { ok: false, reason: 'no_token' };

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await apiClient.post(
      '/notifications/devices',
      {
        expo_push_token: expoPushToken,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        timezone,
      },
      { headers: { Authorization: `Bearer ${authToken}` } },
    );
    return { ok: true };
  } catch {
    return { ok: false, reason: 'register_failed' };
  }
}
