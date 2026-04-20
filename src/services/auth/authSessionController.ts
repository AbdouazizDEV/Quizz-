import { getQuizzApiClient } from '@sdk';
import { useAuthStore } from '@stores/authStore';
import { useOnboardingRegisterStore } from '@stores/onboardingRegisterStore';

import type { AuthBootstrapSnapshot } from './IAuthSessionService';
import { authSessionService } from './authSessionServiceInstance';

/** Charge l’état persisté et aligne le store Zustand (point d’entrée unique pour le splash). */
export async function runAuthBootstrapAndSyncStore(): Promise<AuthBootstrapSnapshot> {
  const snapshot = await authSessionService.bootstrap();
  useAuthStore.getState().applyBootstrap(snapshot);
  return snapshot;
}

/** Persistance + mémoire après connexion ou inscription réussie. */
export async function persistLoginAndSyncStore(token: string): Promise<void> {
  await authSessionService.saveAuthenticatedSession(token);
  useAuthStore.getState().adoptAuthenticatedSession(token);
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
