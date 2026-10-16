import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
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
import { buildQuizQuestionSet } from '@domain/quiz/buildQuizQuestionSet';
import { pointsForDifficulty } from '@domain/quiz/difficultyPoints';
import { getAuthMeFromStore } from '@services/auth/authMeRepository';
import { getQuizPlayRepository } from '@services/quiz/play/quizPlayRepositoryInstance';
import {
  fetchQuizReplayStatus,
  type QuizReplayStatus,
} from '@services/quiz/replay/quizReplayService';
import { useQuizPlaySessionStore } from '@stores/quizPlaySessionStore';
import { useAuthStore } from '@stores/authStore';
import { canVisitorPlayQuiz, lacksAuthToken } from '@services/auth/visitorAccessPolicy';
import { useAppError } from '@providers/AppErrorProvider';

const LOADER_MS = 5000;

interface PendingReplayStart {
  raw: QuizPlayPayload;
  status: QuizReplayStatus;
}

function decodeQuizRouteId(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  try {
    return decodeURIComponent(raw.trim());
  } catch {
    return raw.trim();
  }
}

export default function QuizEntryScreen() {
  const router = useRouter();
  const { showAppError } = useAppError();
  const {
    quizId: idParam,
    categorySlug: catParam,
    duelId: duelParam,
    challengeId: challengeParam,
    competitionId: competitionParam,
    matchId: matchParam,
  } = useLocalSearchParams<{
    quizId: string | string[];
    categorySlug?: string | string[];
    duelId?: string | string[];
    challengeId?: string | string[];
    competitionId?: string | string[];
    matchId?: string | string[];
  }>();
  const quizId = decodeQuizRouteId(typeof idParam === 'string' ? idParam : idParam?.[0]);
  const categorySlug =
    typeof catParam === 'string' ? catParam : Array.isArray(catParam) ? catParam[0] : undefined;
  const duelId =
    typeof duelParam === 'string' ? duelParam : Array.isArray(duelParam) ? duelParam[0] : undefined;
  const challengeId =
    typeof challengeParam === 'string'
      ? challengeParam
      : Array.isArray(challengeParam)
        ? challengeParam[0]
        : undefined;
  const competitionId =
    typeof competitionParam === 'string'
      ? competitionParam
      : Array.isArray(competitionParam)
        ? competitionParam[0]
        : undefined;
  const matchId =
    typeof matchParam === 'string'
      ? matchParam
      : Array.isArray(matchParam)
        ? matchParam[0]
        : undefined;

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
      const playId = raw.quiz.id?.trim() || quizId;
      if (!playId) return;
      const composed = buildQuizQuestionSet({
        pool: raw.questions,
        totalQuestions: raw.questions.length,
        quizLevel: raw.quiz.difficultyLevel,
        seed: playId,
      });
      const payload: QuizPlayPayload = {
        ...raw,
        questions: composed.questions,
      };
      bootstrap(
        payload,
        categorySlug ?? null,
        duelId ?? null,
        challengeId ?? null,
        competitionId ?? null,
        matchId ?? null,
      );
      router.replace(`/quiz/${encodeURIComponent(playId)}/play`);
    },
    [bootstrap, categorySlug, challengeId, competitionId, duelId, matchId, quizId, router],
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
      setError('Quiz indisponible.');
      return;
    }
    let cancelled = false;

    (async () => {
      const repo = getQuizPlayRepository();
      const [raw] = await Promise.all([repo.loadPlayPayload(quizId), delay(LOADER_MS)]);
      if (cancelled) return;

      // GET Nest /quizzes/:id → 404 / vide : bloquer avant de jouer.
      if (!raw?.questions.length) {
        setError('Quiz indisponible.');
        return;
      }

      if (lacksAuthToken(token) && !canVisitorPlayQuiz(raw.quiz.difficultyLevel)) {
        showAppError('Connectez-vous pour accéder à ce quiz.', {
          title: 'Connexion requise',
          confirmLabel: 'Se connecter',
          onClose: () => router.replace(Routes.LOGIN),
        });
        return;
      }

      const maxPts = raw.questions.reduce(
        (sum, q) => sum + pointsForDifficulty(q.difficulty),
        0,
      );
      const uid = getAuthMeFromStore()?.user?.id?.trim();

      if (maxPts > 0 && token?.trim() && uid) {
        const status = await fetchQuizReplayStatus(uid, raw.quiz.id || quizId, maxPts);
        if (cancelled) return;

        if (!status.canReplay) {
          const competitive = Boolean(duelId?.trim() || challengeId?.trim());
          setError(
            competitive
              ? 'Vous avez déjà terminé ce quiz. Il n’est pas rejouable en duel ou challenge.'
              : 'Score maximum déjà atteint sur ce quiz. Rejeu indisponible.',
          );
          return;
        }

        if (status.hasPlayedBefore && status.missingPoints > 0) {
          setPendingReplay({ raw, status });
          return;
        }
      }

      startPlay(raw);
    })();

    return () => {
      cancelled = true;
    };
  }, [challengeId, duelId, quizId, router, showAppError, startPlay, token]);

  useEffect(() => {
    if (!error) return;
    showAppError(error, { title: 'Quiz', onClose: goBack });
  }, [error, goBack, showAppError]);

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
