import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { QuizResultsProcessingModal } from '@components/ui/quiz/play/QuizResultsProcessingModal';
import { QuizPlayNavbar } from '@components/ui/quiz/play/QuizPlayNavbar';
import { QuizQuestionHeader } from '@components/ui/quiz/play/QuizQuestionHeader';
import { Spacing } from '@constants/Spacing';
import { QuizPlayTheme } from '@constants/quizPlayTheme';
import { seedDuelQueryCache } from '@hooks/defis/useDuelQuery';
import { useAuthMe } from '@hooks/useAuthMe';
import { useQuestionTimer } from '@hooks/useQuestionTimer';
import { recordChallengeParticipation } from '@services/defis/participateChallenge.service';
import { submitDuelScore } from '@services/defis/duelRepository';
import { submitCompetitionMatchScore } from '@services/defis/competitionRepository';
import { loadAuthMe } from '@services/auth/authMeRepository';
import { getQuizSessionPersistence } from '@services/quiz/session/quizSessionPersistenceInstance';
import { extractApiError } from '@utils/extractApiError';
import { triggerQuizCorrectFeedback } from '@services/quiz/play/triggerQuizCorrectFeedback';
import { triggerQuizWrongFeedback } from '@services/quiz/play/triggerQuizWrongFeedback';
import { pointsForDifficulty } from '@domain/quiz/difficultyPoints';
import { useQuizPlaySessionStore } from '@stores/quizPlaySessionStore';
import { useAppError } from '@providers/AppErrorProvider';

function decodeQuizRouteId(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  try {
    return decodeURIComponent(raw.trim());
  } catch {
    return raw.trim();
  }
}

export default function QuizPlayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAppError } = useAppError();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';
  const { quizId: idParam } = useLocalSearchParams<{ quizId: string | string[] }>();
  const routeQuizId = typeof idParam === 'string' ? idParam : idParam?.[0];
  const quizId = decodeQuizRouteId(routeQuizId);
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, QuizPlayTheme.contentMaxWidth);

  const payload = useQuizPlaySessionStore((s) => s.payload);
  const duelId = useQuizPlaySessionStore((s) => s.duelId);
  const challengeId = useQuizPlaySessionStore((s) => s.challengeId);
  const competitionId = useQuizPlaySessionStore((s) => s.competitionId);
  const matchId = useQuizPlaySessionStore((s) => s.matchId);
  const currentIndex = useQuizPlaySessionStore((s) => s.currentIndex);
  const sessionPoints = useQuizPlaySessionStore((s) => s.sessionPoints);
  const feedbackPhase = useQuizPlaySessionStore((s) => s.feedbackPhase);
  const sessionPhase = useQuizPlaySessionStore((s) => s.sessionPhase);
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
  const submitLockRef = useRef(false);
  const [isContinueBusy, setIsContinueBusy] = useState(false);

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
    autoStart: feedbackPhase === 'idle' && sessionPhase === 'playing',
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
    if (feedbackPhase === 'idle' && sessionPhase === 'playing') resume();
    else pause();
  }, [feedbackPhase, sessionPhase, pause, resume]);

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
      const state = useQuizPlaySessionStore.getState();
      if (state.sessionPhase !== 'playing' || state.feedbackPhase !== 'idle') return;
      const isCorrect = optionId === question.correctOptionId;
      const pts = pointsForDifficulty(question.difficulty);
      const correctLabel =
        question.options.find((o) => o.id === question.correctOptionId)?.label ?? '—';
      selectOption(optionId, isCorrect, pts, correctLabel);
    },
    [question, selectOption, timeLeft],
  );

  const onContinueAfterFeedback = useCallback(async () => {
    if (submitLockRef.current) return;
    if (!quizId || !payload) return;
    if (useQuizPlaySessionStore.getState().sessionPhase === 'submitting') return;

    const isLastQuestion = currentIndex >= payload.questions.length - 1;
    if (isLastQuestion) {
      submitLockRef.current = true;
      setIsContinueBusy(true);
    }

    const next = advanceFromFeedback();
    if (next === 'continue') {
      submitLockRef.current = false;
      setIsContinueBusy(false);
      return;
    }

    const answers = useQuizPlaySessionStore.getState().answers;
    const earned = useQuizPlaySessionStore.getState().sessionPoints;
    const completeQuizId = payload.quiz.id?.trim() || quizId;
    const res = await getQuizSessionPersistence().recordCompletedSession({
      quizId: completeQuizId,
      earnedPoints: earned,
      answers,
    });
    if (!res.ok) {
      showAppError(extractApiError(res.errorMessage, 'Votre score n’a pas pu être enregistré.'), {
        title: 'Enregistrement',
      });
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
          void loadAuthMe({ force: true });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Score duel non enregistré.';
        if (!message.includes('déjà joué') && !message.includes('déjà terminé')) {
          showAppError(message, { title: 'Duel' });
        }
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

    if (competitionId) {
      try {
        const result = await submitCompetitionMatchScore(competitionId, {
          score: earned,
          matchId: matchId && !matchId.startsWith('g') ? matchId : undefined,
          quizId: completeQuizId,
        });
        if (result.waitingForOthers) {
          Alert.alert('Tournoi', 'Score enregistré — en attente des autres joueurs.');
        } else if (result.tiebreak) {
          Alert.alert('Tournoi', 'Égalité ! Un quiz de barrage va être proposé.');
        }
        await queryClient.invalidateQueries({ queryKey: ['competition'] });
        await queryClient.invalidateQueries({ queryKey: ['competitions'] });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Score tournoi non enregistré.';
        if (!/déjà/i.test(message)) showAppError(message, { title: 'Tournoi' });
      }
    }

    const congratsParams = new URLSearchParams();
    if (duelId) congratsParams.set('duelId', duelId);
    if (challengeId) congratsParams.set('challengeId', challengeId);
    if (competitionId) congratsParams.set('competitionId', competitionId);
    if (matchId) congratsParams.set('matchId', matchId);
    const congratsQs = congratsParams.toString();
    const congratsHref = congratsQs
      ? `/quiz/${quizId}/congrats?${congratsQs}`
      : `/quiz/${quizId}/congrats`;
    router.replace(congratsHref);
  }, [
    advanceFromFeedback,
    challengeId,
    competitionId,
    currentIndex,
    duelId,
    matchId,
    queryClient,
    quizId,
    payload,
    router,
    showAppError,
    userId,
  ]);

  if (!payload || !question) {
    return (
      <View style={styles.fallback}>
        <Text>Chargement…</Text>
      </View>
    );
  }

  const total = payload.questions.length;
  const maxSessionPoints = payload.questions.reduce(
    (sum, q) => sum + pointsForDifficulty(q.difficulty),
    0,
  );
  const isSubmittingResults = sessionPhase === 'submitting';
  const revealed = feedbackPhase !== 'idle' && !isSubmittingResults;
  const questionImageUri = question.imageUrl ?? null;

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
        scrollEnabled={!revealed && !isSubmittingResults}
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
              imageUri={questionImageUri}
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

      {feedbackPhase !== 'idle' && question && !isSubmittingResults ? (
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
          continueLabel={currentIndex >= total - 1 ? 'Voir le score' : 'Continuer'}
          continueDisabled={isContinueBusy}
          onContinue={() => void onContinueAfterFeedback()}
          fonts={fonts}
        />
      ) : null}

      <QuizResultsProcessingModal visible={isSubmittingResults} fonts={fonts} />
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
