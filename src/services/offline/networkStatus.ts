import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export function isNetworkOnline(state: NetInfoState | { isConnected: boolean | null; isInternetReachable?: boolean | null }): boolean {
  if (state.isConnected !== true) return false;
  if (state.isInternetReachable === false) return false;
  return true;
}

export async function fetchNetworkOnline(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
  const state = await NetInfo.fetch();
  return isNetworkOnline(state);
}

export function subscribeNetworkOnline(onChange: (online: boolean) => void): () => void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const handleOnline = () => onChange(true);
    const handleOffline = () => onChange(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    onChange(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  return NetInfo.addEventListener((state) => {
    onChange(isNetworkOnline(state));
  });
}
