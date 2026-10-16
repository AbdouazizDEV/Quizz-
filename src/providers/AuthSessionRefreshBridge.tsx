import { AppState, type AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';

import {
  PROACTIVE_REFRESH_INTERVAL_MS,
  refreshAuthSessionIfNeeded,
} from '@services/auth/refreshAuthSession';
import { getAuthMeFromStore } from '@services/auth/authMeRepository';
import { registerExpoPushDevice } from '@services/notifications/registerExpoPushDevice';
import { syncStreakReminders } from '@services/notifications/streakReminderSync';
import { runOfflineSync } from '@services/offline/offlineSyncEngine';
import { useAuthStore } from '@stores/authStore';

/** Rafraîchit le JWT au retour au premier plan + renouvellement proactif. */
export function AuthSessionRefreshBridge() {
  const appState = useRef(AppState.currentState);
  const pushRegistered = useRef(false);

  useEffect(() => {
    const runStreakCheck = () => {
      if (!useAuthStore.getState().token?.trim()) return;
      const streak = getAuthMeFromStore()?.profile?.streak_days ?? 0;
      void syncStreakReminders(streak);
    };

    const ensurePush = () => {
      if (!useAuthStore.getState().token?.trim() || pushRegistered.current) return;
      void registerExpoPushDevice().then((res) => {
        if (res.ok) pushRegistered.current = true;
      });
    };

    const refreshSession = () => {
      if (!useAuthStore.getState().token?.trim()) return;
      void refreshAuthSessionIfNeeded({ force: false }).then((result) => {
        if (result.ok) void runOfflineSync();
      });
    };

    runStreakCheck();
    ensurePush();
    refreshSession();

    const streakInterval = setInterval(runStreakCheck, 60_000);
    const refreshInterval = setInterval(refreshSession, PROACTIVE_REFRESH_INTERVAL_MS);

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const wasBackground = /inactive|background/.test(appState.current);
      appState.current = nextState;

      if (!wasBackground || nextState !== 'active') return;
      refreshSession();
      runStreakCheck();
      ensurePush();
    });

    return () => {
      clearInterval(streakInterval);
      clearInterval(refreshInterval);
      subscription.remove();
    };
  }, []);

  return null;
}
