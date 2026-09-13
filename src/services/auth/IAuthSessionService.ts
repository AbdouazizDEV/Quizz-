export interface AuthBootstrapSnapshot {
  token: string | null;
  hasRegisteredAccount: boolean;
}

/** Orchestration persistance + état mémoire pour la session (principe de responsabilité unique côté app). */
export interface IAuthSessionService {
  bootstrap(): Promise<AuthBootstrapSnapshot>;
  saveAuthenticatedSession(
    token: string,
    refreshToken?: string | null,
    sessionMeta?: { expires_at?: number; session_expires_at?: number } | null,
  ): Promise<void>;
  signOut(): Promise<void>;
}
