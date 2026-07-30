import { getQuizzApiClient } from '@sdk';
import { useAuthStore } from '@stores/authStore';
import { useOnboardingRegisterStore } from '@stores/onboardingRegisterStore';
import { syncSupabaseAuthSession } from '@services/supabase/syncSupabaseAuthSession';
import { refreshAuthSessionIfNeeded } from '@services/auth/refreshAuthSession';
import { tryProcessPendingFriendInvite } from '@services/network/friendInviteService';

import type { AuthMeResponse } from '@sdk';
import { clearAuthMeCache, loadAuthMe, setAuthMeCache } from '@services/auth/authMeRepository';

import type { AuthBootstrapSnapshot } from './IAuthSessionService';
import { authSessionService } from './authSessionServiceInstance';

/** Charge l’état persisté et aligne le store Zustand (point d’entrée unique pour le splash). */
export async function runAuthBootstrapAndSyncStore(): Promise<AuthBootstrapSnapshot> {
  const snapshot = await authSessionService.bootstrap();
  useAuthStore.getState().applyBootstrap(snapshot);
  if (snapshot.token?.trim()) {
    const refreshed = await refreshAuthSessionIfNeeded({ force: true });
    if (!refreshed.ok) {
      try {
        await syncSupabaseAuthSession(snapshot.token);
      } catch {
        /* refresh token absent ou expiré : reconnexion requise pour les écritures Supabase */
      }
    }
    void loadAuthMe({ force: false });
    void tryProcessPendingFriendInvite();
  } else {
    await clearAuthMeCache();
  }
  return snapshot;
}

/** Persistance + mémoire après connexion ou inscription réussie. */
export async function persistLoginAndSyncStore(
  token: string,
  refreshToken?: string | null,
  authMeSeed?: AuthMeResponse | null,
): Promise<void> {
  await authSessionService.saveAuthenticatedSession(token, refreshToken);
  useAuthStore.getState().adoptAuthenticatedSession(token);
  await syncSupabaseAuthSession(token, refreshToken);
  if (authMeSeed) {
    await setAuthMeCache(authMeSeed);
  }
  await loadAuthMe({ force: true });
  void tryProcessPendingFriendInvite();
}

/** Déconnexion : invalide la session côté API si possible, efface le stockage local et le store. */
export async function signOutAndSyncStore(): Promise<void> {
  const token = useAuthStore.getState().token;
  if (token) {
    try {
      await getQuizzApiClient().POST('/auth/logout', {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      /* déconnexion locale même si l’API échoue */
    }
  }
  await authSessionService.signOut();
  await clearAuthMeCache();
  useOnboardingRegisterStore.getState().clear();
  useAuthStore.getState().clearSession();
}
