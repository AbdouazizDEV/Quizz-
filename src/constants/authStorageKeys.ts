/** Clés de persistance liées à l’authentification (AsyncStorage / SecureStore). */
export const AUTH_STORAGE_KEYS = {
  sessionToken: 'quizz.auth.session_token',
  refreshToken: 'quizz.auth.refresh_token',
  sessionExpiresAt: 'quizz.auth.session_expires_at',
  /** Fin absolue de session (unix sec) — auth mot de passe max 24 h. */
  sessionHardExpiresAt: 'quizz.auth.session_hard_expires_at',
  hasRegisteredAccount: 'quizz.auth.has_registered_account',
} as const;
