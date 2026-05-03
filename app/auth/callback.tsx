import { addEventListener, getInitialURL, useLinkingURL } from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Routes } from '@constants/Routes';
import { persistLoginAndSyncStore } from '@services/auth/authSessionController';

/** Même logique que le flux OAuth implicite Supabase : le jeton est surtout dans le fragment #… */
function extractAuthParams(url: string): { access_token: string | null } {
  try {
    const hashIdx = url.indexOf('#');
    const qIdx = url.indexOf('?');
    let segment = '';
    if (hashIdx >= 0) {
      segment = url.slice(hashIdx + 1);
    } else if (qIdx >= 0) {
      segment = url.split('?')[1]?.split('#')[0] ?? '';
    }
    if (!segment) return { access_token: null };
    const sp = new URLSearchParams(segment);
    return { access_token: sp.get('access_token') };
  } catch {
    return { access_token: null };
  }
}

function oauthErrorFromUrl(url: string): string | null {
  try {
    const segment =
      url.includes('#') ? url.split('#').slice(1).join('#') : url.split('?')[1]?.split('#')[0] ?? '';
    if (!segment.includes('error')) return null;
    const sp = new URLSearchParams(segment);
    return [sp.get('error'), sp.get('error_description')].filter(Boolean).join(' — ') || null;
  } catch {
    return null;
  }
}

export default function AuthEmailCallbackScreen() {
  const router = useRouter();
  const linkingUrl = useLinkingURL();
  const [message, setMessage] = useState('Connexion…');
  const processedRef = useRef(false);

  useEffect(() => {
    const maxWait = setTimeout(() => {
      if (processedRef.current) return;
      processedRef.current = true;
      setMessage(
        'Connexion interrompue : ouverture du lien incomplète sur cet appareil. Réessayez depuis Connexion ou utilisez e-mail / mot de passe.',
      );
      setTimeout(() => router.replace(Routes.LOGIN), 4000);
    }, 18_000);

    return () => clearTimeout(maxWait);
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const processUrl = async (url: string | null | undefined) => {
      if (!url?.trim() || cancelled || processedRef.current) return;

      const oauthErr = oauthErrorFromUrl(url);
      if (oauthErr) {
        processedRef.current = true;
        setMessage(oauthErr);
        setTimeout(() => router.replace(Routes.LOGIN), 2500);
        return;
      }

      const { access_token: accessToken } = extractAuthParams(url);
      if (!accessToken) {
        /** Fragment souvent absent sur getInitialURL() Android ; on attend un autre événement Linking. */
        return;
      }

      processedRef.current = true;
      try {
        await persistLoginAndSyncStore(accessToken);
        router.replace(Routes.HOME);
      } catch {
        setMessage('Impossible d’enregistrer la session.');
        setTimeout(() => router.replace(Routes.LOGIN), 2500);
      }
    };

    void getInitialURL().then((u) => void processUrl(u));

    if (linkingUrl) {
      void processUrl(linkingUrl);
    }

    const sub = addEventListener('url', ({ url }) => void processUrl(url));

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [linkingUrl, router]);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  text: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
  },
});
