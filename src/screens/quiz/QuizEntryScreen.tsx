import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, View } from 'react-native';
import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { QuizLogoMark } from '@components/ui/quiz/play/QuizLogoMark';
import { QuizReplayInfoModal } from '@components/ui/quiz/play/QuizReplayInfoModal';
import { QuizPlayTheme } from '@constants/quizPlayTheme';
import { Routes } from '@constants/Routes';
import type { QuizPlayPayload } from '@app-types/quizPlay.types';
import { delay } from '@utils/delay';
import { shuffleArray } from '@utils/shuffleArray';
import { getQuizPlayRepository } from '@services/quiz/play/quizPlayRepositoryInstance';
import {
  fetchQuizReplayStatus,
  type QuizReplayStatus,
} from '@services/quiz/replay/quizReplayService';
import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';
import { useQuizPlaySessionStore } from '@stores/quizPlaySessionStore';
import { useAuthStore } from '@stores/authStore';
import { canVisitorPlayQuiz, lacksAuthToken } from '@services/auth/visitorAccessPolicy';

const LOADER_MS = 5000;

interface PendingReplayStart {
  raw: QuizPlayPayload;
  status: QuizReplayStatus;
}

export default function QuizEntryScreen() {
  const router = useRouter();
  const { quizId: idParam, categorySlug: catParam } = useLocalSearchParams<{
    quizId: string | string[];
    categorySlug?: string | string[];
  }>();
  const quizId = typeof idParam === 'string' ? idParam : idParam?.[0];
  const categorySlug =
    typeof catParam === 'string' ? catParam : Array.isArray(catParam) ? catParam[0] : undefined;

  const [fontsLoaded] = useFonts({ Nunito_700Bold, Nunito_600SemiBold });
  const bootstrap = useQuizPlaySessionStore((s) => s.bootstrap);
  const reset = useQuizPlaySessionStore((s) => s.reset);
  const token = useAuthStore((s) => s.token);

  const [error, setError] = useState<string | null>(null);
  const [pendingReplay, setPendingReplay] = useState<PendingReplayStart | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const fonts = useMemo(
    () => ({
      bold: fontsLoaded ? 'Nunito_700Bold' : undefined,
      semiBold: fontsLoaded ? 'Nunito_600SemiBold' : undefined,
    }),
    [fontsLoaded],
  );

  const goBack = useCallback(() => {
    reset();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  }, [reset, router]);

  const startPlay = useCallback(
    (raw: QuizPlayPayload) => {
      if (!quizId) return;
      const payload: QuizPlayPayload = {
        ...raw,
        questions: shuffleArray(raw.questions),
      };
      bootstrap(payload, categorySlug ?? null);
      router.replace(`/quiz/${quizId}/play`);
    },
    [bootstrap, categorySlug, quizId, router],
  );

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
    let cancelled = false;

    (async () => {
      if (lacksAuthToken(token)) {
        const client = getSupabaseClient();
        if (client) {
          const { data: quizMeta } = await client
            .from('quizzes')
            .select('difficulty_level')
            .eq('id', quizId)
            .maybeSingle();
          if (cancelled) return;
          if (!canVisitorPlayQuiz(quizMeta?.difficulty_level)) {
            Alert.alert('Connexion requise', 'Connectez-vous pour accéder à ce quiz.', [
              { text: 'OK', onPress: () => router.replace(Routes.LOGIN) },
            ]);
            return;
          }
        }
      }

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
            const status = await fetchQuizReplayStatus(uid, quizId, maxPts);
            if (cancelled) return;

            if (!status.canReplay) {
              setError('Score maximum déjà atteint sur ce quiz. Rejeu indisponible.');
              return;
            }

            if (status.hasPlayedBefore && status.missingPoints > 0) {
              setPendingReplay({ raw, status });
              return;
            }
          }
        }
      }

      startPlay(raw);
    })();

    return () => {
      cancelled = true;
    };
  }, [quizId, router, startPlay, token]);

  useEffect(() => {
    if (!error) return;
    Alert.alert('Quiz', error, [{ text: 'OK', onPress: goBack }]);
  }, [error, goBack]);

  const onConfirmReplay = useCallback(() => {
    if (!pendingReplay) return;
    const raw = pendingReplay.raw;
    setPendingReplay(null);
    startPlay(raw);
  }, [pendingReplay, startPlay]);

  const onCancelReplay = useCallback(() => {
    setPendingReplay(null);
    goBack();
  }, [goBack]);

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

      <Text style={[styles.brand, fonts.bold && { fontFamily: fonts.bold }]}>Quizz</Text>
      <QuizLogoMark size={112} />
      <Text style={[styles.loading, fonts.bold && { fontFamily: fonts.bold }]}>Chargement...</Text>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthInterpolated }]} />
      </View>

      {error ? <ActivityIndicator color="#FFF" style={{ marginTop: 24 }} /> : null}

      {pendingReplay ? (
        <QuizReplayInfoModal
          visible
          quizTitle={pendingReplay.raw.quiz.title}
          bestScore={pendingReplay.status.bestScore}
          maxScore={pendingReplay.status.maxScore}
          missingPoints={pendingReplay.status.missingPoints}
          onContinue={onConfirmReplay}
          onCancel={onCancelReplay}
          fonts={fonts}
        />
      ) : null}
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
