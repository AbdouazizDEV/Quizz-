import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import {
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuizAnswerGrid } from '@components/ui/quiz/play/QuizAnswerGrid';
import { QuizFeedbackFunFactModal } from '@components/ui/quiz/play/QuizFeedbackFunFactModal';
import { QuizPlayNavbar } from '@components/ui/quiz/play/QuizPlayNavbar';
import { QuizQuestionHeader } from '@components/ui/quiz/play/QuizQuestionHeader';
import { Spacing } from '@constants/Spacing';
import { QuizPlayTheme } from '@constants/quizPlayTheme';
import { seedDuelQueryCache } from '@hooks/defis/useDuelQuery';
import { useAuthMe } from '@hooks/useAuthMe';
import { useQuestionTimer } from '@hooks/useQuestionTimer';
import { recordChallengeParticipation } from '@services/defis/participateChallenge.service';
import { submitDuelScore } from '@services/defis/duelRepository';
import { invalidateAuthMeCache } from '@services/auth/authMeRepository';
import { getQuizSessionPersistence } from '@services/quiz/session/quizSessionPersistenceInstance';
import { triggerQuizCorrectFeedback } from '@services/quiz/play/triggerQuizCorrectFeedback';
import { triggerQuizWrongFeedback } from '@services/quiz/play/triggerQuizWrongFeedback';
import { useQuizPlaySessionStore } from '@stores/quizPlaySessionStore';
import { useAppError } from '@providers/AppErrorProvider';

export default function QuizPlayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAppError } = useAppError();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';
  const { quizId: idParam } = useLocalSearchParams<{ quizId: string | string[] }>();
  const quizId = typeof idParam === 'string' ? idParam : idParam?.[0];
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, QuizPlayTheme.contentMaxWidth);

  const payload = useQuizPlaySessionStore((s) => s.payload);
  const duelId = useQuizPlaySessionStore((s) => s.duelId);
  const challengeId = useQuizPlaySessionStore((s) => s.challengeId);
  const currentIndex = useQuizPlaySessionStore((s) => s.currentIndex);
  const sessionPoints = useQuizPlaySessionStore((s) => s.sessionPoints);
  const feedbackPhase = useQuizPlaySessionStore((s) => s.feedbackPhase);
  const selectedOptionId = useQuizPlaySessionStore((s) => s.selectedOptionId);
  const lastPointsEarned = useQuizPlaySessionStore((s) => s.lastPointsEarned);
  const correctAnswerLabel = useQuizPlaySessionStore((s) => s.correctAnswerLabel);
  const selectOption = useQuizPlaySessionStore((s) => s.selectOption);
  const advanceFromFeedback = useQuizPlaySessionStore((s) => s.advanceFromFeedback);
  const reset = useQuizPlaySessionStore((s) => s.reset);
  const secondsPerQuestion = useQuizPlaySessionStore((s) => s.secondsPerQuestion);
  const expireQuestion = useQuizPlaySessionStore((s) => s.expireQuestion);

  const expiredForQuestionRef = useRef(false);
  const wrongFeedbackKeyRef = useRef<string | null>(null);
  const correctFeedbackKeyRef = useRef<string | null>(null);

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_500Medium,
  });

  const fonts = useMemo(
    () => ({
      bold: fontsLoaded ? 'Nunito_700Bold' : undefined,
      semiBold: fontsLoaded ? 'Nunito_600SemiBold' : undefined,
      medium: fontsLoaded ? 'Nunito_500Medium' : undefined,
    }),
    [fontsLoaded],
  );

  const question = useMemo(() => {
    if (!payload?.questions.length) return null;
    return payload.questions[currentIndex] ?? null;
  }, [payload, currentIndex]);

  const handleTimerExpire = useCallback(() => {
    if (expiredForQuestionRef.current) return;
    expiredForQuestionRef.current = true;
    const q = useQuizPlaySessionStore.getState().getCurrentQuestion();
    if (!q) return;
    const correctLabel =
      q.options.find((o) => o.id === q.correctOptionId)?.label ?? '—';
    expireQuestion(correctLabel);
  }, [expireQuestion]);

  const { timeLeft, progress, pause, resume } = useQuestionTimer({
    duration: secondsPerQuestion,
    onExpire: handleTimerExpire,
    resetKey: currentIndex,
    autoStart: feedbackPhase === 'idle',
  });

  useEffect(() => {
    if (!payload || !quizId) {
      showAppError('Les données du quiz sont absentes ou la session a expiré.', {
        title: 'Session',
        onClose: () => router.back(),
      });
    }
  }, [payload, quizId, router, showAppError]);

  useEffect(() => {
    expiredForQuestionRef.current = false;
  }, [currentIndex]);

  useEffect(() => {
    if (feedbackPhase === 'idle') resume();
    else pause();
  }, [feedbackPhase, pause, resume]);

  useEffect(() => {
    if (feedbackPhase === 'correct') {
      wrongFeedbackKeyRef.current = null;
      const key = `${currentIndex}-correct`;
      if (correctFeedbackKeyRef.current === key) return;
      correctFeedbackKeyRef.current = key;
      void triggerQuizCorrectFeedback();
      return;
    }
    correctFeedbackKeyRef.current = null;

    if (feedbackPhase !== 'incorrect' && feedbackPhase !== 'timeout') {
      wrongFeedbackKeyRef.current = null;
      return;
    }
    const key = `${currentIndex}-${feedbackPhase}`;
    if (wrongFeedbackKeyRef.current === key) return;
    wrongFeedbackKeyRef.current = key;
    void triggerQuizWrongFeedback();
  }, [feedbackPhase, currentIndex]);

  const onMenu = useCallback(() => {
    Alert.alert('Quitter le quiz ?', 'Ta progression sur cette question sera perdue.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Quitter',
        style: 'destructive',
        onPress: () => {
          reset();
          router.back();
        },
      },
    ]);
  }, [reset, router]);

  const onPick = useCallback(
    (optionId: string) => {
      if (timeLeft <= 0 || !question || !payload) return;
      if (useQuizPlaySessionStore.getState().feedbackPhase !== 'idle') return;
      const isCorrect = optionId === question.correctOptionId;
      const pts = payload.quiz.pointsPerQuestion;
      const correctLabel =
        question.options.find((o) => o.id === question.correctOptionId)?.label ?? '—';
      selectOption(optionId, isCorrect, pts, correctLabel);
    },
    [question, payload, selectOption, timeLeft],
  );

  const onContinueAfterFeedback = useCallback(async () => {
    if (!quizId || !payload) return;
    const next = advanceFromFeedback();
    if (next === 'continue') return;

    const answers = useQuizPlaySessionStore.getState().answers;
    const earned = useQuizPlaySessionStore.getState().sessionPoints;
    const res = await getQuizSessionPersistence().recordCompletedSession({
      quizId,
      earnedPoints: earned,
      answers,
    });
    if (!res.ok) {
      showAppError(res.errorMessage ?? 'Votre score n\'a pas pu être enregistré.', {
        title: 'Enregistrement',
      });
    } else {
      void invalidateAuthMeCache();
    }

    if (duelId) {
      try {
        const result = await submitDuelScore(duelId, earned);
        if (result.queued) {
          Alert.alert('Duel', 'Score enregistré — synchronisation à la reconnexion.');
        } else if (result.data) {
          seedDuelQueryCache(queryClient, result.data);
          await queryClient.invalidateQueries({ queryKey: ['duels-pending'] });
          await queryClient.invalidateQueries({ queryKey: ['duels-recent'] });
          await queryClient.invalidateQueries({ queryKey: ['duels-pending-list'] });
          await queryClient.invalidateQueries({ queryKey: ['duels-recent-list'] });
        }
      } catch (error) {
        showAppError(
          error instanceof Error ? error.message : 'Score duel non enregistré.',
          { title: 'Duel' },
        );
      }
    }

    if (challengeId && userId) {
      try {
        const result = await recordChallengeParticipation(userId, challengeId, quizId, earned);
        if (result.queued) {
          Alert.alert('Challenge', 'Score enregistré — synchronisation à la reconnexion.');
        }
        await queryClient.invalidateQueries({ queryKey: ['weekly-challenges'] });
        await queryClient.invalidateQueries({ queryKey: ['challenge', challengeId, userId] });
        await queryClient.invalidateQueries({
          queryKey: ['challenge-leaderboard', challengeId, userId],
        });
      } catch (error) {
        showAppError(
          error instanceof Error ? error.message : 'Score challenge non enregistré.',
          { title: 'Challenge' },
        );
      }
    }

    const congratsParams = new URLSearchParams();
    if (duelId) congratsParams.set('duelId', duelId);
    if (challengeId) congratsParams.set('challengeId', challengeId);
    const congratsQs = congratsParams.toString();
    const congratsHref = congratsQs
      ? `/quiz/${quizId}/congrats?${congratsQs}`
      : `/quiz/${quizId}/congrats`;
    router.replace(congratsHref);
  }, [advanceFromFeedback, challengeId, duelId, queryClient, quizId, payload, router, showAppError, userId]);

  if (!payload || !question) {
    return (
      <View style={styles.fallback}>
        <Text>Chargement…</Text>
      </View>
    );
  }

  const total = payload.questions.length;
  const maxSessionPoints = total * (payload.quiz.pointsPerQuestion ?? 1);
  const revealed = feedbackPhase !== 'idle';
  const imageUri = payload.quiz.thumbnailUrl;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient colors={['#FFFFFF', '#FAFAFA']} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 16,
            paddingHorizontal: Spacing.screenHorizontal,
            paddingBottom: 140,
            gap: 28,
          },
        ]}
        scrollEnabled={!revealed}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.inner, { width: contentWidth, maxWidth: contentWidth, gap: 24 }]}>
          <QuizPlayNavbar
            current={currentIndex + 1}
            total={total}
            sessionPoints={sessionPoints}
            maxSessionPoints={maxSessionPoints}
            timerSeconds={timeLeft}
            timerMax={secondsPerQuestion}
            fonts={fonts}
            onMenuPress={onMenu}
          />

          <View style={[styles.body, { gap: 24 }]}>
            <QuizQuestionHeader
              imageUri={imageUri}
              questionText={question.questionText}
              fonts={fonts}
            />
            <QuizAnswerGrid
              questionId={question.id}
              options={question.options}
              columnWidth={contentWidth}
              gap={12}
              fonts={fonts}
              selectedId={selectedOptionId}
              correctId={question.correctOptionId}
              revealed={revealed}
              onSelect={onPick}
            />
          </View>
        </View>
      </ScrollView>

      {feedbackPhase !== 'idle' && question ? (
        <QuizFeedbackFunFactModal
          visible={revealed}
          phase={feedbackPhase}
          pointsEarnedLabel={
            feedbackPhase === 'correct'
              ? `+${lastPointsEarned} point${lastPointsEarned > 1 ? 's' : ''}`
              : ''
          }
          funFact={question.explanation?.trim() ?? ''}
          correctAnswerLabel={
            feedbackPhase === 'incorrect' || feedbackPhase === 'timeout' ? correctAnswerLabel : undefined
          }
          onContinue={onContinueAfterFeedback}
          fonts={fonts}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  scroll: { alignItems: 'center' },
  inner: { alignItems: 'flex-start' },
  body: { width: '100%', alignItems: 'center' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
