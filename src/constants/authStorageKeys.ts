/** Clés de persistance liées à l’authentification (AsyncStorage / SecureStore). */
export const AUTH_STORAGE_KEYS = {
  sessionToken: 'quizz.auth.session_token',
  hasRegisteredAccount: 'quizz.auth.has_registered_account',
} as const;
