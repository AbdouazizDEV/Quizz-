import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { fetchNetworkOnline, subscribeNetworkOnline } from '@services/offline/networkStatus';
import { offlineStore } from '@services/offline/OfflineStore';
import { runOfflineSync, updateOfflinePendingCount } from '@services/offline/offlineSyncEngine';
import { useNetworkStore } from '@stores/networkStore';

interface OfflineProviderProps {
  children: ReactNode;
}

/** Initialise SQLite offline + écoute la connectivité réseau + sync FIFO. */
export function OfflineProvider({ children }: OfflineProviderProps) {
  useEffect(() => {
    let cancelled = false;

    void offlineStore.init().then(async () => {
      if (cancelled) return;
      await updateOfflinePendingCount();
      if (await fetchNetworkOnline()) {
        await runOfflineSync();
      }
      if (!cancelled) useNetworkStore.getState().setReady(true);
    });

    void fetchNetworkOnline().then((online) => {
      if (!cancelled) useNetworkStore.getState().setOnline(online);
    });

    const unsubscribe = subscribeNetworkOnline((online) => {
      useNetworkStore.getState().setOnline(online);
      if (online) {
        void runOfflineSync();
      } else {
        void updateOfflinePendingCount();
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return children;
}
