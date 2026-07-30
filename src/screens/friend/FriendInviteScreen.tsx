import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatisticsNavbar } from '@components/ui/statistics/StatisticsNavbar';
import { Spacing } from '@constants/Spacing';
import { Routes } from '@constants/Routes';
import { useAuthMe } from '@hooks/useAuthMe';
import { useAppError } from '@providers/AppErrorProvider';
import {
  decodeFriendInviteToken,
  sendFriendInviteFromToken,
} from '@services/network/friendInviteService';
import { storePendingFriendInvite } from '@services/network/pendingFriendInvite';
import { useAuthStore } from '@stores/authStore';

const fonts = { bold: undefined as string | undefined };

export default function FriendInviteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAppError } = useAppError();
  const { d } = useLocalSearchParams<{ d?: string | string[] }>();
  const token = (Array.isArray(d) ? d[0] : d)?.trim() ?? '';

  const authToken = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const { data: me } = useAuthMe();
  const myUserId = me?.user?.id?.trim() ?? '';

  const [busy, setBusy] = useState(false);
  const handledRef = useRef(false);

  const profile = token ? decodeFriendInviteToken(token) : null;

  const goHome = useCallback(() => {
    router.replace(Routes.HOME);
  }, [router]);

  const processInvite = useCallback(async () => {
    if (!token || busy || handledRef.current) return;

    if (!authToken?.trim()) {
      await storePendingFriendInvite(token);
      return;
    }

    handledRef.current = true;
    setBusy(true);
    try {
      const result = await sendFriendInviteFromToken(token, myUserId || undefined);
      if (result.ok) {
        Alert.alert('Demande envoyée', `Ta demande d’ami a été envoyée à ${result.profile.n}.`, [
          { text: 'OK', onPress: goHome },
        ]);
        return;
      }

      handledRef.current = false;
      if (result.code === 'not_logged_in') return;
      showAppError(result.message, {
        title: 'Invitation ami',
        onRetry: result.code === 'api_error' ? () => void processInvite() : undefined,
      });
      if (result.code === 'self' || result.code === 'invalid') {
        setTimeout(goHome, 1500);
      }
    } finally {
      setBusy(false);
    }
  }, [authToken, busy, goHome, myUserId, showAppError, token]);

  useEffect(() => {
    if (!hydrated || !token) return;
    if (!profile) {
      showAppError('Invitation invalide ou expirée.', { title: 'Invitation ami' });
      setTimeout(goHome, 2000);
      return;
    }
    if (authToken?.trim()) {
      void processInvite();
    } else {
      void storePendingFriendInvite(token);
    }
  }, [authToken, goHome, hydrated, processInvite, profile, showAppError, token]);

  const onLogin = useCallback(() => {
    router.push(Routes.LOGIN);
  }, [router]);

  if (!hydrated) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2A2D5E" />
      </View>
    );
  }

  if (!token || !profile) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2A2D5E" />
      </View>
    );
  }

  if (!authToken?.trim()) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#FFFFFF', '#F8F8F8']} style={StyleSheet.absoluteFillObject} />
        <View style={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
          <StatisticsNavbar title="Invitation ami" fonts={fonts} onBack={goHome} fullWidth />
          <View style={styles.card}>
            <Text style={styles.title}>{profile.n} t’invite sur Quizz+</Text>
            <Text style={styles.body}>
              Connecte-toi ou crée un compte pour lui envoyer une demande d’ami.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={onLogin}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
            >
              <Text style={styles.primaryBtnText}>Se connecter</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.centered, { paddingTop: insets.top }]}>
      <ActivityIndicator size="large" color="#2A2D5E" />
      <Text style={styles.loadingText}>Envoi de la demande d’ami…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontal,
    gap: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  loadingText: { color: '#616161', fontSize: 15 },
  card: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8F0',
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1F2347' },
  body: { fontSize: 15, lineHeight: 22, color: '#616161' },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#2A2D5E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnPressed: { opacity: 0.88 },
});
