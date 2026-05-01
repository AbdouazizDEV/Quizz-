import * as Linking from 'expo-linking';

import { getQuizzApiClient, parseQuizzApiError } from '@sdk';

export type SocialAuthProvider = 'google' | 'facebook';

async function startSocialAuth(provider: SocialAuthProvider): Promise<void> {
  const endpoint = provider === 'google' ? '/auth/google' : '/auth/facebook';
  const { data, error } = await getQuizzApiClient().POST(endpoint);
  const url = data?.url;
  if (error || !url) {
    throw new Error(parseQuizzApiError(error) ?? `Connexion ${provider} indisponible.`);
  }
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error(`Impossible d'ouvrir le navigateur pour ${provider}.`);
  }
  await Linking.openURL(url);
}

export const socialAuthGateway = {
  startGoogle: () => startSocialAuth('google'),
  startFacebook: () => startSocialAuth('facebook'),
};
