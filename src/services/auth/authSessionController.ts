import { AppConfig } from '@config';
import { useAuthStore } from '@stores/authStore';
import { useOnboardingRegisterStore } from '@stores/onboardingRegisterStore';
import {
  isAccessTokenLikelyExpired,
  refreshAuthSessionIfNeeded,
  shouldForceLogoutAfterRefreshFailure,
} from '@services/auth/refreshAuthSession';
import { tryProcessPendingFriendInvite } from '@services/network/friendInviteService';

import type { AuthMeResponse } from '@sdk';
import type { AuthSessionPayload } from '@app-types/authSession.types';
import { clearAuthMeCache, loadAuthMe, setAuthMeCache } from '@services/auth/authMeRepository';

import type { AuthBootstrapSnapshot } from './IAuthSessionService';
import {
  clearStoredSessionHardExpiresAt,
  readStoredRefreshToken,
  readStoredSessionExpiresAt,
  readStoredSessionHardExpiresAt,
} from './authTokenStorage';
import { authSessionService } from './authSessionServiceInstance';

/** Charge l’état persisté et aligne le store Zustand (point d’entrée unique pour le splash). */
export async function runAuthBootstrapAndSyncStore(): Promise<AuthBootstrapSnapshot> {
  const hardExpiresAt = await readStoredSessionHardExpiresAt();
  if (hardExpiresAt != null && Date.now() / 1000 >= hardExpiresAt) {
    await authSessionService.signOut();
    useAuthStore.getState().clearSession();
    await clearAuthMeCache();
    return { token: null, hasRegisteredAccount: true };
  }

  const snapshot = await authSessionService.bootstrap();
  useAuthStore.getState().applyBootstrap(snapshot);
  if (snapshot.token?.trim()) {
    const storedExpiresAt = await readStoredSessionExpiresAt();
    const accessExpired = isAccessTokenLikelyExpired(snapshot.token, storedExpiresAt);
    const refreshed = await refreshAuthSessionIfNeeded({ force: accessExpired });
    if (!refreshed.ok && shouldForceLogoutAfterRefreshFailure(refreshed, snapshot.token, storedExpiresAt)) {
      await signOutAndSyncStore();
      return { token: null, hasRegisteredAccount: true };
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
  sessionMeta?: Pick<AuthSessionPayload, 'expires_at' | 'session_expires_at'> | null,
): Promise<void> {
  await authSessionService.saveAuthenticatedSession(token, refreshToken, sessionMeta);
  useAuthStore.getState().adoptAuthenticatedSession(token);
  if (authMeSeed) {
    await setAuthMeCache(authMeSeed);
  }
  await loadAuthMe({ force: true });
  void tryProcessPendingFriendInvite();
}

/** Applique une session complète renvoyée par le backend (passkey ou mot de passe). */
export async function persistPasskeyAuthResult(
  session: AuthSessionPayload,
  authMeSeed?: AuthMeResponse | null,
): Promise<void> {
  const token = session.access_token?.trim();
  if (!token) throw new Error('Session absente.');

  // Passkey : pas de plafond 24 h local — on efface une éventuelle limite précédente.
  if (typeof session.session_expires_at !== 'number') {
    await clearStoredSessionHardExpiresAt();
  }

  await persistLoginAndSyncStore(token, session.refresh_token, authMeSeed, session);
}

/** Déconnexion : invalide la session côté API si possible, efface le stockage local et le store. */
export async function signOutAndSyncStore(): Promise<void> {
  const token = useAuthStore.getState().token;
  const refreshToken = await readStoredRefreshToken();
  if (token) {
    try {
      await fetch(`${AppConfig.API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
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
