import { Platform } from 'react-native';

const DEFAULT_LOCAL_IOS = 'http://localhost:3000/api/v1';
const DEFAULT_LOCAL_ANDROID = 'http://10.0.2.2:3000/api/v1';

/**
 * Résout l’URL de l’API backend.
 * Priorité : EXPO_PUBLIC_API_URL → défaut plateforme (iOS localhost, Android 10.0.2.2).
 */
export function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (Platform.OS === 'android') return DEFAULT_LOCAL_ANDROID;
  return DEFAULT_LOCAL_IOS;
}

export function resolveWsBaseUrl(apiBaseUrl: string): string {
  try {
    const url = new URL(apiBaseUrl);
    url.pathname = '';
    url.search = '';
    url.hash = '';
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${url.host}`;
  } catch {
    return 'ws://localhost:3000';
  }
}
