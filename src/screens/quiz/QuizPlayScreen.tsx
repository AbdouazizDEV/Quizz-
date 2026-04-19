import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuizAnswerGrid } from '@components/ui/quiz/play/QuizAnswerGrid';
import { QuizNextActionBar } from '@components/ui/quiz/play/QuizNextActionBar';
import { QuizPlayNavbar } from '@components/ui/quiz/play/QuizPlayNavbar';
import { QuizQuestionHeader } from '@components/ui/quiz/play/QuizQuestionHeader';
import { QuizResultBanner } from '@components/ui/quiz/play/QuizResultBanner';
import { Spacing } from '@constants/Spacing';
import { QuizPlayTheme } from '@constants/quizPlayTheme';
import { getQuizSessionPersistence } from '@services/quiz/session/quizSessionPersistenceInstance';
import { useQuizPlaySessionStore } from '@stores/quizPlaySessionStore';

export default function QuizPlayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { quizId: idParam } = useLocalSearchParams<{ quizId: string | string[] }>();
  const quizId = typeof idParam === 'string' ? idParam : idParam?.[0];
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, QuizPlayTheme.contentMaxWidth);

  const payload = useQuizPlaySessionStore((s) => s.payload);
  const currentIndex = useQuizPlaySessionStore((s) => s.currentIndex);
  const sessionPoints = useQuizPlaySessionStore((s) => s.sessionPoints);
  const feedbackPhase = useQuizPlaySessionStore((s) => s.feedbackPhase);
  const selectedOptionId = useQuizPlaySessionStore((s) => s.selectedOptionId);
  const feedbackChipLabel = useQuizPlaySessionStore((s) => s.feedbackChipLabel);
  const selectOption = useQuizPlaySessionStore((s) => s.selectOption);
  const advanceFromFeedback = useQuizPlaySessionStore((s) => s.advanceFromFeedback);
  const reset = useQuizPlaySessionStore((s) => s.reset);
  const secondsPerQuestion = useQuizPlaySessionStore((s) => s.secondsPerQuestion);

  const [timer, setTimer] = useState(secondsPerQuestion);

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

  useEffect(() => {
    if (!payload || !quizId) {
      Alert.alert('Session', 'Données du quiz absentes.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [payload, quizId, router]);

  useEffect(() => {
    if (feedbackPhase !== 'idle') return;
    setTimer(secondsPerQuestion);
    const t = setInterval(() => {
      setTimer((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [currentIndex, feedbackPhase, secondsPerQuestion]);

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
      if (!question || !payload) return;
      const isCorrect = optionId === question.correctOptionId;
      const pts = payload.quiz.pointsPerQuestion;
      const correctLabel =
        question.options.find((o) => o.id === question.correctOptionId)?.label ?? '—';
      const chipWrong = `Réponse : ${correctLabel}`;
      selectOption(optionId, isCorrect, pts, chipWrong);
    },
    [question, payload, selectOption],
  );

  const onNext = useCallback(async () => {
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
      Alert.alert('Enregistrement', res.errorMessage ?? 'Score non enregistré.');
    }
    router.replace(`/quiz/${quizId}/congrats`);
  }, [advanceFromFeedback, quizId, payload, router]);

  if (!payload || !question) {
    return (
      <View style={styles.fallback}>
        <Text>Chargement…</Text>
      </View>
    );
  }

  const total = payload.questions.length;
  const revealed = feedbackPhase !== 'idle';
  const imageUri = payload.quiz.thumbnailUrl;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient colors={['#FFFFFF', '#FAFAFA']} style={StyleSheet.absoluteFillObject} />

      {feedbackPhase === 'correct' ? (
        <QuizResultBanner phase="correct" title="Correct!" chipLabel={feedbackChipLabel} fonts={fonts} />
      ) : null}
      {feedbackPhase === 'incorrect' ? (
        <QuizResultBanner phase="incorrect" title="Incorrect!" chipLabel={feedbackChipLabel} fonts={fonts} />
      ) : null}

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
            timerSeconds={timer}
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

      <QuizNextActionBar
        visible={revealed}
        label="Suivant"
        fonts={fonts}
        onPress={onNext}
      />
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
