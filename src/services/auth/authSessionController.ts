import { useAuthStore } from '@stores/authStore';

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

/** Déconnexion : efface le jeton stocké et le store (le drapeau « compte déjà créé » reste pour le splash → login). */
export async function signOutAndSyncStore(): Promise<void> {
  await authSessionService.signOut();
  useAuthStore.getState().clearSession();
}
