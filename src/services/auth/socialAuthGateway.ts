import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { getQuizzApiClient, parseQuizzApiError } from '@sdk';

export type SocialAuthProvider = 'google' | 'facebook';

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
  const redirectTo = Linking.createURL('/auth/callback');
  const { data, error } = await getQuizzApiClient().POST(endpoint, {
    body: { redirect_to: redirectTo },
  });
  const url = data?.url;
  if (error || !url) {
    throw new Error(parseQuizzApiError(error) ?? `Connexion ${provider} indisponible.`);
  }

  await WebBrowser.warmUpAsync();
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
    await WebBrowser.coolDownAsync();
  }
}

export const socialAuthGateway = {
  startGoogle: () => startSocialAuth('google'),
  startFacebook: () => startSocialAuth('facebook'),
};
