import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { getQuizzApiClient, parseQuizzApiError } from '@sdk';

export type SocialAuthProvider = 'google' | 'facebook';

function getAppLinkScheme(): string {
  const raw = Constants.expoConfig?.scheme;
  if (typeof raw === 'string' && raw.length > 0) return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string' && raw[0].length > 0) return raw[0];
  return 'quizzplus';
}

/**
 * URL de retour Supabase → doit figurer dans Supabase Auth → Redirect URLs (`quizzplus://auth/callback`).
 * Sur mobile, ne pas utiliser seul `Linking.createURL` en dev : il produit `localhost`, invalide sur un vrai téléphone.
 */
export function getOAuthRedirectUri(): string {
  if (Platform.OS === 'web') {
    return Linking.createURL('/auth/callback');
  }
  return `${getAppLinkScheme()}://auth/callback`;
}

function extractAccessTokenFromUrl(url: string): string | null {
  try {
    const afterHash = url.includes('#') ? url.split('#')[1] ?? '' : '';
    const afterQuery = url.includes('?') ? url.split('?')[1]?.split('#')[0] ?? '' : '';
    const source = afterHash || afterQuery;
    if (!source) return null;
    const params = new URLSearchParams(source);
    const token = params.get('access_token');
    return token?.trim() || null;
  } catch {
    return null;
  }
}

async function startSocialAuth(provider: SocialAuthProvider): Promise<string> {
  const endpoint = provider === 'google' ? '/auth/google' : '/auth/facebook';
  const redirectTo = getOAuthRedirectUri();
  const { data, error } = await getQuizzApiClient().POST(endpoint, {
    body: { redirect_to: redirectTo },
  });
  const url = data?.url;
  if (error || !url) {
    throw new Error(parseQuizzApiError(error) ?? `Connexion ${provider} indisponible.`);
  }

  if (Platform.OS === 'android') {
    try {
      await WebBrowser.warmUpAsync();
    } catch {
      // indisponible sur certaines plateformes
    }
  }

  try {
    const result = await WebBrowser.openAuthSessionAsync(url, redirectTo);
    if (result.type !== 'success' || !result.url) {
      throw new Error('Connexion sociale annulee.');
    }
    const accessToken = extractAccessTokenFromUrl(result.url);
    if (!accessToken) {
      throw new Error('Connexion sociale incomplete: token introuvable.');
    }
    return accessToken;
  } finally {
    if (Platform.OS === 'android') {
      try {
        await WebBrowser.coolDownAsync();
      } catch {
        // idem
      }
    }
  }
}

export const socialAuthGateway = {
  startGoogle: () => startSocialAuth('google'),
  startFacebook: () => startSocialAuth('facebook'),
};
