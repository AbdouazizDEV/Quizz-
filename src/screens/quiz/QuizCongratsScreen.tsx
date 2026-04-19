import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuizCongratsFlowers } from '@components/ui/quiz/play/QuizCongratsFlowers';
import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { QuizPlayTheme } from '@constants/quizPlayTheme';
import type { QuizLeaderboardEntry } from '@app-types/quizPlay.types';
import { getQuizLeaderboardPort } from '@services/quiz/leaderboard/quizLeaderboardInstance';
import { getQuizScoreSharePort } from '@services/quiz/share/quizScoreShareInstance';
import { useQuizPlaySessionStore } from '@stores/quizPlaySessionStore';

export default function QuizCongratsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { quizId: idParam } = useLocalSearchParams<{ quizId: string | string[] }>();
  const quizId = typeof idParam === 'string' ? idParam : idParam?.[0];
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, QuizPlayTheme.contentMaxWidth);

  const payload = useQuizPlaySessionStore((s) => s.payload);
  const answers = useQuizPlaySessionStore((s) => s.answers);
  const sessionPoints = useQuizPlaySessionStore((s) => s.sessionPoints);
  const categorySlug = useQuizPlaySessionStore((s) => s.categorySlug);
  const reset = useQuizPlaySessionStore((s) => s.reset);

  const [leaderboard, setLeaderboard] = useState<QuizLeaderboardEntry[]>([]);

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

  const total = answers.length;
  const correctCount = useMemo(() => answers.filter((a) => a.isCorrect).length, [answers]);
  const isGreatScore = total > 0 && correctCount > total / 2;

  useEffect(() => {
    if (!quizId) return;
    void (async () => {
      const port = getQuizLeaderboardPort();
      setLeaderboard(await port.fetchLeaderboardForQuiz(quizId, 7));
    })();
  }, [quizId]);

  const goCategory = useCallback(() => {
    reset();
    if (categorySlug) {
      router.replace(`${Routes.CATEGORIES}/${categorySlug}`);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace(Routes.HOME);
  }, [categorySlug, reset, router]);

  const onShare = useCallback(async () => {
    if (!payload) return;
    await getQuizScoreSharePort().shareScore({
      quizTitle: payload.quiz.title,
      score: sessionPoints,
      correctCount,
      total,
    });
  }, [payload, sessionPoints, correctCount, total]);

  const title = isGreatScore ? 'Félicitations !' : 'Quiz terminé';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={['#FFD54A', '#FFB703']} style={StyleSheet.absoluteFillObject} />
      <QuizCongratsFlowers active={isGreatScore} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={goCategory} style={styles.closeBtn} accessibilityRole="button">
          <Feather name="x" size={26} color="#FFF" />
        </Pressable>
        <Text style={[styles.headerTitle, fonts.bold && { fontFamily: fonts.bold }]}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.screenHorizontal,
          paddingBottom: insets.bottom + 32,
          alignItems: 'center',
          gap: 20,
        }}
      >
        <View style={[styles.card, { width: contentWidth }]}>
          <Text style={[styles.scoreLabel, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
            Ton score
          </Text>
          <Text style={[styles.scoreBig, fonts.bold && { fontFamily: fonts.bold }]}>{sessionPoints}</Text>
          <Text style={[styles.sub, fonts.medium && { fontFamily: fonts.medium }]}>
            {correctCount} / {total} bonnes réponses
          </Text>
          {!isGreatScore ? (
            <Text style={[styles.hint, fonts.medium && { fontFamily: fonts.medium }]}>
              Continue à t’entraîner pour dépasser la moitié des bonnes réponses et débloquer l’écran
              festif.
            </Text>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, fonts.bold && { fontFamily: fonts.bold }]}>
          Classement sur ce quiz
        </Text>
        <View style={[styles.list, { width: contentWidth }]}>
          {leaderboard.map((row) => (
            <View key={row.rank} style={styles.row}>
              <Text style={[styles.rank, fonts.bold && { fontFamily: fonts.bold }]}>{row.rank}</Text>
              <Text style={[styles.name, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
                {row.displayName}
              </Text>
              <Text style={[styles.pts, fonts.bold && { fontFamily: fonts.bold }]}>{row.score}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.actions, { width: contentWidth }]}>
          <Pressable style={styles.actionBtn} onPress={onShare}>
            <Feather name="share-2" size={20} color="#1F2261" />
            <Text style={[styles.actionTxt, fonts.semiBold && { fontFamily: fonts.semiBold }]}>Partager</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={goCategory}>
            <Feather name="list" size={20} color="#1F2261" />
            <Text style={[styles.actionTxt, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
              Mes quiz
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFB703' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  card: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  scoreLabel: { fontSize: 14, color: '#616161', fontWeight: '600' },
  scoreBig: { fontSize: 44, fontWeight: '900', color: '#212121' },
  sub: { fontSize: 16, color: '#424242' },
  hint: { fontSize: 13, color: '#757575', textAlign: 'center', marginTop: 8 },
  sectionTitle: {
    alignSelf: 'flex-start',
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
    zIndex: 1,
  },
  list: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
  },
  rank: { width: 32, fontSize: 16, color: '#212121' },
  name: { flex: 1, fontSize: 16, color: '#212121' },
  pts: { fontSize: 16, color: '#212121' },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    zIndex: 1,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 16,
  },
  actionTxt: { fontSize: 15, fontWeight: '700', color: '#212121' },
});
