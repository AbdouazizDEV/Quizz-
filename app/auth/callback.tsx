import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Routes } from '@constants/Routes';
import { persistLoginAndSyncStore } from '@services/auth/authSessionController';

function extractAuthParams(url: string): { access_token: string | null } {
  try {
    let segment = '';
    if (url.includes('?')) {
      segment = url.split('?')[1]?.split('#')[0] ?? '';
    }
    if (!segment && url.includes('#')) {
      segment = url.split('#')[1] ?? '';
    }
    if (!segment) return { access_token: null };
    const sp = new URLSearchParams(segment);
    return { access_token: sp.get('access_token') };
  } catch {
    return { access_token: null };
  }
}

export default function AuthEmailCallbackScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('Connexion…');

  useEffect(() => {
    let cancelled = false;

    const finish = async (url: string | null) => {
      if (!url || cancelled) return;
      const { access_token: accessToken } = extractAuthParams(url);
      if (!accessToken) {
        setMessage('Lien invalide ou expiré.');
        setTimeout(() => router.replace(Routes.LOGIN), 2000);
        return;
      }
      try {
        await persistLoginAndSyncStore(accessToken);
        router.replace(Routes.HOME);
      } catch {
        setMessage('Impossible d’enregistrer la session.');
        setTimeout(() => router.replace(Routes.LOGIN), 2000);
      }
    };

    void Linking.getInitialURL().then((url) => void finish(url));

    const sub = Linking.addEventListener('url', ({ url }) => void finish(url));
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [router]);

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
