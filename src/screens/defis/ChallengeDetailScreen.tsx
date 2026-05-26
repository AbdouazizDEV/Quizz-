import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ChallengeCompetitionHero } from '@components/ui/defis/challenge/ChallengeCompetitionHero';
import { ChallengeQuizMissionRow } from '@components/ui/defis/challenge/ChallengeQuizMissionRow';
import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { DefisRoutes } from '@constants/defisRoutes';
import { CHALLENGE_UI } from '@constants/challengeUiTheme';
import { COLORS } from '@constants/Colors';
import { buildQuizEntryHref } from '@constants/Routes';
import { useChallenge } from '@hooks/defis/useChallenge';
import { useAuthMe } from '@hooks/useAuthMe';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import type { DailyQuiz } from '@app-types/challenge.types';
import {
  assertCanParticipateInChallengeQuiz,
  ChallengeParticipationError,
} from '@services/defis/participateChallenge.service';
import { useAppError } from '@providers/AppErrorProvider';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challengeId = typeof id === 'string' ? id : '';
  const router = useRouter();
  const { showAppError } = useAppError();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id;
  const { isOnline } = useNetworkStatus();
  const { data, isLoading, isError, error } = useChallenge(challengeId, userId);

  const onStartQuiz = async (quiz: DailyQuiz) => {
    if (!userId || !challengeId) return;
    try {
      await assertCanParticipateInChallengeQuiz(
        userId,
        challengeId,
        quiz.quizId,
        quiz.scheduledDay,
      );
      router.push(buildQuizEntryHref(quiz.quizId, { challengeId }));
    } catch (err) {
      if (err instanceof ChallengeParticipationError) {
        showAppError(err.message, { title: 'Challenge' });
        return;
      }
      showAppError('Impossible de lancer ce quiz.', { title: 'Challenge' });
    }
  };

  return (
    <DefisPageShell title="Challenge">
      {isLoading && !data ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : isError ? (
        <Text style={styles.error}>
          {error instanceof Error ? error.message : 'Impossible de charger ce challenge.'}
        </Text>
      ) : data ? (
        <Animated.View entering={FadeInDown.duration(350)} style={styles.content}>
          {!isOnline ? (
            <View style={styles.offlineBanner}>
              <Feather name="wifi-off" size={14} color={COLORS.textSecondary} />
              <Text style={styles.offlineHint}>Données en cache — reconnectez-vous pour actualiser.</Text>
            </View>
          ) : null}

          <ChallengeCompetitionHero
            title={data.challenge.title}
            endsAt={data.challenge.endsAt}
            rewardText={data.challenge.rewardText}
            userRank={data.userRank}
            userScore={data.userScore}
            quizzesPlayed={data.quizzesPlayed}
            totalQuizzes={data.totalQuizzes}
          />

          <View style={styles.sectionHead}>
            <Feather name="layers" size={18} color={CHALLENGE_UI.navy} />
            <Text style={styles.sectionTitle}>Missions quiz</Text>
          </View>

          <DefisSurfaceCard style={styles.missionsCard}>
            {data.dailyQuizzes.map((quiz, index) => (
              <ChallengeQuizMissionRow
                key={quiz.quizId}
                quiz={quiz}
                index={index}
                isLast={index === data.dailyQuizzes.length - 1}
                onStart={() => void onStartQuiz(quiz)}
              />
            ))}
          </DefisSurfaceCard>

          <Pressable
            onPress={() => router.push(DefisRoutes.challengeLeaderboard(challengeId))}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            <LinearGradient
              colors={['#1F2261', '#2A3E8C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.leaderboardCta}
            >
              <View style={styles.leaderboardCtaLeft}>
                <Feather name="bar-chart-2" size={22} color="#FFD54A" />
                <View>
                  <Text style={styles.leaderboardCtaTitle}>Voir le classement</Text>
                  <Text style={styles.leaderboardCtaSub}>Comparez vos scores aux autres joueurs</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={22} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      ) : null}
    </DefisPageShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, width: '100%' },
  loader: { marginTop: 32 },
  error: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 12,
  },
  offlineHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: CHALLENGE_UI.navy,
  },
  missionsCard: {
    borderColor: CHALLENGE_UI.heroBorder,
    borderWidth: 1,
  },
  leaderboardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 18,
    gap: 12,
  },
  leaderboardCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  leaderboardCtaTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  leaderboardCtaSub: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
});
