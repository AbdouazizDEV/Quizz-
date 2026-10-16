import { loginWithGoogleIdToken } from '@services/auth/googleAuthService';
import { requestGoogleIdToken } from '@services/auth/googleSignInNative';
import { isGoogleSignInConfigured } from '@config';

export type SocialAuthProvider = 'google' | 'facebook';

/** Conservé pour compatibilité deep links ; plus utilisé pour Google natif. */
export function getOAuthRedirectUri(): string {
  return 'quizzplus://auth/callback';
}

/** Google natif (id_token) → POST /auth/google/token. Facebook indisponible. */
export async function signInWithSocialProvider(provider: SocialAuthProvider): Promise<string> {
  if (provider === 'google') {
    if (!isGoogleSignInConfigured()) {
      throw new Error('Connexion Google indisponible. Configurez EXPO_PUBLIC_GOOGLE_CLIENT_ID.');
    }
    return requestGoogleIdToken();
  }
  throw new Error('Connexion Facebook indisponible.');
}

export const socialAuthGateway = {
  startGoogle: () => signInWithSocialProvider('google'),
  startFacebook: () => signInWithSocialProvider('facebook'),
};

export { loginWithGoogleIdToken };
