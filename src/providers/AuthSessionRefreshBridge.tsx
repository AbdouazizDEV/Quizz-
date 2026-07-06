import { AppState, type AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';

import { refreshAuthSessionIfNeeded } from '@services/auth/refreshAuthSession';
import { runOfflineSync } from '@services/offline/offlineSyncEngine';
import { useAuthStore } from '@stores/authStore';

/** Rafraîchit le JWT au retour au premier plan (session expirée pendant que l’app était en arrière-plan). */
export function AuthSessionRefreshBridge() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const wasBackground = /inactive|background/.test(appState.current);
      appState.current = nextState;

      if (!wasBackground || nextState !== 'active') return;
      if (!useAuthStore.getState().token?.trim()) return;

      void refreshAuthSessionIfNeeded({ force: true }).then((result) => {
        if (result.ok) void runOfflineSync();
      });
    });

    return () => subscription.remove();
  }, []);

  return null;
}
