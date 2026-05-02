import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, View } from 'react-native';
import {
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { QuizLogoMark } from '@components/ui/quiz/play/QuizLogoMark';
import { QuizPlayTheme } from '@constants/quizPlayTheme';
import { Routes } from '@constants/Routes';
import type { QuizPlayPayload } from '@app-types/quizPlay.types';
import { delay } from '@utils/delay';
import { shuffleArray } from '@utils/shuffleArray';
import { getQuizPlayRepository } from '@services/quiz/play/quizPlayRepositoryInstance';
import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';
import { useQuizPlaySessionStore } from '@stores/quizPlaySessionStore';
import { useAuthStore } from '@stores/authStore';
import { canVisitorAccessCategory, isVisitorSession } from '@services/auth/visitorAccessPolicy';

const LOADER_MS = 5000;

export default function QuizEntryScreen() {
  const router = useRouter();
  const { quizId: idParam, categorySlug: catParam } = useLocalSearchParams<{
    quizId: string | string[];
    categorySlug?: string | string[];
  }>();
  const quizId = typeof idParam === 'string' ? idParam : idParam?.[0];
  const categorySlug =
    typeof catParam === 'string' ? catParam : Array.isArray(catParam) ? catParam[0] : undefined;

  const [fontsLoaded] = useFonts({ Nunito_700Bold });
  const bootstrap = useQuizPlaySessionStore((s) => s.bootstrap);
  const reset = useQuizPlaySessionStore((s) => s.reset);
  const token = useAuthStore((s) => s.token);
  const hasRegisteredAccount = useAuthStore((s) => s.hasRegisteredAccount);

  const [error, setError] = useState<string | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const goBack = useCallback(() => {
    reset();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  }, [reset, router]);

  useEffect(() => {
    reset();
    Animated.timing(progress, {
      toValue: 1,
      duration: LOADER_MS,
      useNativeDriver: false,
    }).start();
  }, [quizId, reset, progress]);

  useEffect(() => {
    if (!quizId) {
      setError('Quiz introuvable.');
      return;
    }
    if (
      isVisitorSession({ token, hasRegisteredAccount }) &&
      (!categorySlug || !canVisitorAccessCategory({ slug: categorySlug }))
    ) {
      Alert.alert('Connexion requise', "Connectez-vous pour acceder a ce quiz.", [
        { text: 'OK', onPress: () => router.replace(Routes.LOGIN) },
      ]);
      return;
    }

    let cancelled = false;

    (async () => {
      const repo = getQuizPlayRepository();
      const [raw] = await Promise.all([repo.loadPlayPayload(quizId), delay(LOADER_MS)]);
      if (cancelled) return;
      if (!raw?.questions.length) {
        setError('Impossible de charger ce quiz.');
        return;
      }

      const maxPts = raw.questions.length * (raw.quiz.pointsPerQuestion ?? 1);
      const tok = token?.trim();
      if (maxPts > 0 && tok) {
        const client = getSupabaseClient();
        if (client) {
          const { data: authData } = await client.auth.getUser(tok);
          const uid = authData.user?.id;
          if (uid) {
            const { data: bestRows } = await client
              .from('quiz_sessions')
              .select('score')
              .eq('quiz_id', quizId)
              .eq('user_id', uid)
              .eq('is_completed', true)
              .order('score', { ascending: false })
              .limit(1);
            const best = bestRows?.[0]?.score ?? 0;
            if (best >= maxPts) {
              setError('Score maximum déjà atteint sur ce quiz. Rejeu indisponible.');
              return;
            }
          }
        }
      }

      const payload: QuizPlayPayload = {
        ...raw,
        questions: shuffleArray(raw.questions),
      };
      bootstrap(payload, categorySlug ?? null);
      router.replace(`/quiz/${quizId}/play`);
    })();

    return () => {
      cancelled = true;
    };
  }, [quizId, categorySlug, bootstrap, router, hasRegisteredAccount, token]);

  useEffect(() => {
    if (!error) return;
    Alert.alert('Quiz', error, [{ text: 'OK', onPress: goBack }]);
  }, [error, goBack]);

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={['#FFD54A', QuizPlayTheme.loaderBg]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.pattern1} />
      <View style={styles.pattern2} />

      <Text style={[styles.brand, fontsLoaded && { fontFamily: 'Nunito_700Bold' }]}>Quizz</Text>
      <QuizLogoMark size={112} />
      <Text style={[styles.loading, fontsLoaded && { fontFamily: 'Nunito_700Bold' }]}>Chargement...</Text>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthInterpolated }]} />
      </View>

      {error ? <ActivityIndicator color="#FFF" style={{ marginTop: 24 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: QuizPlayTheme.loaderBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  pattern1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: '12%',
    right: -80,
    transform: [{ rotate: '12deg' }],
  },
  pattern2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: '8%',
    left: -60,
    transform: [{ rotate: '-8deg' }],
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  track: {
    width: 280,
    height: 16,
    borderRadius: 100,
    backgroundColor: QuizPlayTheme.loaderTrack,
    overflow: 'hidden',
    marginTop: 12,
  },
  fill: {
    height: '100%',
    backgroundColor: QuizPlayTheme.loaderFill,
    borderRadius: 100,
  },
});
