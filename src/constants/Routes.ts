export const Routes = {
  SPLASH: '/',
  WALKTHROUGH: '/(auth)/walkthrough',
  LOGIN: '/(auth)/login',
  FORGOT_PASSWORD: '/(auth)/forgot-password',
  FORGOT_PASSWORD_OTP: '/(auth)/forgot-password/otp',
  FORGOT_PASSWORD_NEW: '/(auth)/forgot-password/new-password',
  CREATE_ACCOUNT_TYPE: '/(auth)/create-account-type',
  CREATE_ACCOUNT_WORKPLACE: '/(auth)/create-account-workplace',
  CREATE_ACCOUNT_PROFILE: '/(auth)/create-account-profile',
  REGISTER: '/(auth)/register',
  /** Retour après clic sur le lien de confirmation (deep link quizzplus://auth/callback). */
  AUTH_EMAIL_CALLBACK: '/auth/callback',
  HOME: '/(tabs)/home',
  /** Liste des catégories (grille). */
  CATEGORIES: '/categories',
  SCOREBOARD: '/scoreboard',
  PLAYERS: '/players',
  PROFILE: '/(tabs)/profile',
  STATISTICS: '/statistics',
  NETWORK: '/network',
  SETTINGS: '/settings',
  SETTINGS_PERSONAL: '/settings/personal-info',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_MUSIC: '/settings/music',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_HELP: '/settings/help',
  SETTINGS_ABOUT: '/settings/about',
  PREMIUM: '/premium',
  PREMIUM_COMPARE: '/premium/compare',
  PREMIUM_PLANS: '/premium/plans',
  PREMIUM_PAYMENT: '/premium/payment',
  PREMIUM_SUCCESS: '/premium/success',
} as const;

export function buildUserProfileHref(userId: string): string {
  return `/users/${encodeURIComponent(userId)}`;
}

/** Loader 5s + fetch des questions (`app/quiz/[quizId]/index`). */
export function buildQuizEntryHref(quizId: string, categorySlug?: string | null): string {
  const id = encodeURIComponent(quizId);
  if (categorySlug) {
    return `/quiz/${id}?categorySlug=${encodeURIComponent(categorySlug)}`;
  }
  return `/quiz/${id}`;
}
