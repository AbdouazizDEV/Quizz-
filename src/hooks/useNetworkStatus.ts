import { useNetworkStore } from '@stores/networkStore';

export function useNetworkStatus(): { isOnline: boolean; ready: boolean; pendingSyncCount: number } {
  const isOnline = useNetworkStore((s) => s.isOnline);
  const ready = useNetworkStore((s) => s.ready);
  const pendingSyncCount = useNetworkStore((s) => s.pendingSyncCount);

  return { isOnline, ready, pendingSyncCount };
}
