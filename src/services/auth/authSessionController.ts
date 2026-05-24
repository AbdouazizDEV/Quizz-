import { getQuizzApiClient } from '@sdk';
import { useAuthStore } from '@stores/authStore';
import { useOnboardingRegisterStore } from '@stores/onboardingRegisterStore';
import { syncSupabaseAuthSession } from '@services/supabase/syncSupabaseAuthSession';

import type { AuthBootstrapSnapshot } from './IAuthSessionService';
import { authSessionService } from './authSessionServiceInstance';

/** Charge l’état persisté et aligne le store Zustand (point d’entrée unique pour le splash). */
export async function runAuthBootstrapAndSyncStore(): Promise<AuthBootstrapSnapshot> {
  const snapshot = await authSessionService.bootstrap();
  useAuthStore.getState().applyBootstrap(snapshot);
  if (snapshot.token?.trim()) {
    try {
      await syncSupabaseAuthSession(snapshot.token);
    } catch {
      /* refresh token absent ou expiré : reconnexion requise pour les écritures Supabase */
    }
  }
  return snapshot;
}

/** Persistance + mémoire après connexion ou inscription réussie. */
export async function persistLoginAndSyncStore(
  token: string,
  refreshToken?: string | null,
): Promise<void> {
  await authSessionService.saveAuthenticatedSession(token, refreshToken);
  useAuthStore.getState().adoptAuthenticatedSession(token);
  await syncSupabaseAuthSession(token, refreshToken);
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
  useOnboardingRegisterStore.getState().clear();
  useAuthStore.getState().clearSession();
}
