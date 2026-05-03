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
 */
export function getOAuthRedirectUri(): string {
  if (Platform.OS === 'web') {
    return Linking.createURL('/auth/callback');
  }
  return `${getAppLinkScheme()}://auth/callback`;
}

function looksLikeJwt(accessToken: string): boolean {
  return accessToken.split('.').length === 3 && accessToken.length > 40;
}

function extractOAuthErrorFromUrl(url: string): string | null {
  try {
    const fragment = url.includes('#') ? url.split('#').slice(1).join('#') : '';
    const query = url.includes('?') ? url.split('?')[1]?.split('#')[0] ?? '' : '';
    const segment = fragment || query;
    if (!segment) return null;
    const params = new URLSearchParams(segment);
    const code = params.get('error') ?? params.get('error_code');
    const desc = params.get('error_description');
    if (!code && !desc) return null;
    return [code, desc].filter(Boolean).join(' — ') || 'Erreur OAuth.';
  } catch {
    return null;
  }
}

function extractAccessTokenFromUrl(url: string): string | null {
  try {
    const hashIdx = url.indexOf('#');
    const qIdx = url.indexOf('?');
    let segment = '';
    if (hashIdx >= 0) {
      segment = url.slice(hashIdx + 1);
    } else if (qIdx >= 0) {
      segment = url.split('?')[1]?.split('#')[0] ?? '';
    }
    if (!segment) return null;

    const params = new URLSearchParams(segment);
    let token = params.get('access_token');
    if (!token && segment.includes('access_token=')) {
      const m = segment.match(/access_token=([^&]*)/);
      if (m?.[1]) {
        try {
          token = decodeURIComponent(m[1]);
        } catch {
          token = m[1];
        }
      }
    }
    const t = token?.trim();
    if (!t || !looksLikeJwt(t)) return null;
    return t;
  } catch {
    return null;
  }
}

type ConsumeResult = { kind: 'token'; token: string } | { kind: 'error'; message: string } | { kind: 'none' };

function tryConsumeOAuthUrl(incoming: string | null | undefined): ConsumeResult {
  if (!incoming?.trim()) return { kind: 'none' };
  const errMsg = extractOAuthErrorFromUrl(incoming);
  if (errMsg) return { kind: 'error', message: errMsg };
  const token = extractAccessTokenFromUrl(incoming);
  if (token) return { kind: 'token', token };
  return { kind: 'none' };
}

/**
 * Sur Android, `openAuthSessionAsync` renvoie parfois une URL sans fragment ; le deep link contient
 * alors `#access_token=…`. On combine WebBrowser + écoute `Linking`.
 */
async function openOAuthSessionAndGetAccessToken(
  authorizeUrl: string,
  redirectTo: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let maxWaitTimer: ReturnType<typeof setTimeout> | undefined;
    let shortWaitTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      if (maxWaitTimer) clearTimeout(maxWaitTimer);
      if (shortWaitTimer) clearTimeout(shortWaitTimer);
      subscription.remove();
      action();
    };

    const onIncomingUrl = (url: string | null | undefined) => {
      if (!url || settled) return;
      const r = tryConsumeOAuthUrl(url);
      if (r.kind === 'error') {
        finish(() => reject(new Error(r.message)));
        return;
      }
      if (r.kind === 'token') {
        finish(() => resolve(r.token));
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => onIncomingUrl(url));

    maxWaitTimer = setTimeout(
      () =>
        finish(() =>
          reject(
            new Error(
              'Connexion sociale : délai dépassé. Réessayez ou utilisez e-mail / mot de passe.',
            ),
          ),
        ),
      120_000,
    );

    void Linking.getInitialURL().then((u) => onIncomingUrl(u));

    if (Platform.OS === 'android') {
      try {
        void WebBrowser.warmUpAsync();
      } catch {
        /* indisponible */
      }
    }

    void WebBrowser.openAuthSessionAsync(authorizeUrl, redirectTo)
      .then((result) => {
        if (result.type !== 'success' || !result.url) {
          if (result.type === 'cancel' || result.type === 'dismiss') {
            finish(() => reject(new Error('Connexion sociale annulee.')));
          } else if (result.type === 'success' && !result.url) {
            finish(() => reject(new Error('Connexion sociale : réponse navigateur invalide.')));
          }
          return;
        }

        onIncomingUrl(result.url);

        /** Session Chrome sans fragment : attendre le deep link complet (souvent < 1 s). */
        const r = tryConsumeOAuthUrl(result.url);
        if (r.kind === 'none') {
          shortWaitTimer = setTimeout(() => {
            if (settled) return;
            finish(() =>
              reject(
                new Error(
                  'Connexion sociale : impossible de récupérer le jeton. Réessayez ou connectez-vous par e-mail.',
                ),
              ),
            );
          }, 3500);
        }
      })
      .catch((e) => finish(() => reject(e instanceof Error ? e : new Error(String(e)))))
      .finally(() => {
        if (Platform.OS === 'android') {
          try {
            void WebBrowser.coolDownAsync();
          } catch {
            /* indisponible */
          }
        }
      });
  });
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

  if (Platform.OS === 'web') {
    const result = await WebBrowser.openAuthSessionAsync(url, redirectTo);
    if (result.type !== 'success' || !result.url) {
      throw new Error('Connexion sociale annulee.');
    }
    const errMsg = extractOAuthErrorFromUrl(result.url);
    if (errMsg) throw new Error(errMsg);
    const token = extractAccessTokenFromUrl(result.url);
    if (!token) throw new Error('Connexion sociale incomplete: token introuvable.');
    return token;
  }

  return openOAuthSessionAndGetAccessToken(url, redirectTo);
}

export const socialAuthGateway = {
  startGoogle: () => startSocialAuth('google'),
  startFacebook: () => startSocialAuth('facebook'),
};
