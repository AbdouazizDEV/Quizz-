import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CountdownTimer } from '@components/atoms/CountdownTimer';
import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { DefisTabSwitcher } from '@components/ui/defis/DefisTabSwitcher';
import { SectionTitle } from '@components/ui/common/SectionTitle';
import { DefisRoutes } from '@constants/defisRoutes';
import { COLORS } from '@constants/Colors';
import { useChallenge } from '@hooks/defis/useChallenge';
import { useAuthMe } from '@hooks/useAuthMe';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import {
  fetchActiveWeeklyChallenges,
  fetchPastWeeklyChallenges,
} from '@services/defis/challengeRepository';
import type { DailyQuiz, WeeklyChallenge } from '@app-types/challenge.types';
import { buildQuizEntryHref } from '@constants/Routes';
import {
  assertCanParticipateInChallengeQuiz,
  ChallengeParticipationError,
} from '@services/defis/participateChallenge.service';
import { useAppError } from '@providers/AppErrorProvider';

type ChallengeTab = 'active' | 'past';

const TABS = [
  { id: 'active' as const, label: 'En cours' },
  { id: 'past' as const, label: 'Passés' },
];

export default function ChallengeListScreen() {
  const [tab, setTab] = useState<ChallengeTab>('active');
  const router = useRouter();
  const { showAppError } = useAppError();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id;
  const { isOnline } = useNetworkStatus();

  const {
    data: activeChallenges,
    isLoading: loadingActive,
    isError: activeError,
    error: activeQueryError,
  } = useQuery({
    queryKey: ['weekly-challenges', 'active'],
    queryFn: fetchActiveWeeklyChallenges,
  });

  const {
    data: pastChallenges,
    isLoading: loadingPast,
    isError: pastError,
    error: pastQueryError,
  } = useQuery({
    queryKey: ['weekly-challenges', 'past'],
    queryFn: fetchPastWeeklyChallenges,
    enabled: tab === 'past',
  });

  const primaryChallenge = activeChallenges?.[0] ?? null;
  const { data: progress, isLoading: loadingProgress } = useChallenge(
    primaryChallenge?.id,
    userId,
  );

  const loading = tab === 'active' ? loadingActive || loadingProgress : loadingPast;
  const listError = tab === 'active' ? activeQueryError : pastQueryError;
  const hasListError = tab === 'active' ? activeError : pastError;
  const visibleChallenges = tab === 'active' ? (activeChallenges ?? []) : (pastChallenges ?? []);

  const onPlayQuiz = async (quiz: DailyQuiz) => {
    if (!userId || !primaryChallenge) return;
    try {
      await assertCanParticipateInChallengeQuiz(
        userId,
        primaryChallenge.id,
        quiz.quizId,
        quiz.scheduledDay,
      );
      router.push(buildQuizEntryHref(quiz.quizId, { challengeId: primaryChallenge.id }));
    } catch (error) {
      if (error instanceof ChallengeParticipationError) {
        showAppError(error.message, { title: 'Challenge' });
        return;
      }
      showAppError('Impossible de lancer ce quiz.', { title: 'Challenge' });
    }
  };

  return (
    <DefisPageShell title="Challenges">
      <DefisTabSwitcher tabs={TABS} activeTab={tab} onChange={setTab} />

      {loading ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : null}
      {!isOnline && visibleChallenges.length > 0 ? (
        <Text style={styles.offlineHint}>Données en cache — reconnectez-vous pour actualiser.</Text>
      ) : null}
      {hasListError ? (
        <Text style={styles.empty}>
          {listError instanceof Error
            ? listError.message
            : 'Impossible de charger les challenges.'}
        </Text>
      ) : null}

      {tab === 'active' && primaryChallenge && progress ? (
        <>
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightEyebrow}>🏆 Challenge en cours</Text>
              <Text style={styles.highlightTitle}>{primaryChallenge.title}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress.totalQuizzes > 0 ? (progress.quizzesPlayed / progress.totalQuizzes) * 100 : 0}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {progress.quizzesPlayed}/{progress.totalQuizzes} quiz
              </Text>
              <CountdownTimer endsAt={primaryChallenge.endsAt} />
              <Pressable
                style={styles.cta}
                onPress={() => {
                  const next = progress.dailyQuizzes.find((q) => q.isAvailable && !q.isPlayed);
                  if (next) void onPlayQuiz(next);
                  else router.push(DefisRoutes.challengeDetail(primaryChallenge.id));
                }}
              >
                <Text style={styles.ctaText}>Jouer maintenant →</Text>
              </Pressable>
            </View>
          </Animated.View>

          <SectionTitle title="Mon score" />
          <View style={styles.statsRow}>
            <StatBox value={String(progress.userScore)} label="pts" />
            <StatBox value={progress.userRank ? `#${progress.userRank}` : '—'} label="rang" />
            <StatBox value={`${progress.quizzesPlayed}/${progress.totalQuizzes}`} label="joués" />
          </View>

          <SectionTitle title={`Quiz du jour (${formatTodayFr()})`} />
          <DefisSurfaceCard>
            {progress.dailyQuizzes.map((quiz, index) => (
              <DailyQuizRow
                key={quiz.quizId}
                quiz={quiz}
                isLast={index === progress.dailyQuizzes.length - 1}
                onPress={() => {
                  if (quiz.isAvailable && !quiz.isPlayed) void onPlayQuiz(quiz);
                  else router.push(DefisRoutes.challengeDetail(primaryChallenge.id));
                }}
              />
            ))}
          </DefisSurfaceCard>

          <Pressable
            style={styles.linkBtn}
            onPress={() => router.push(DefisRoutes.challengeLeaderboard(primaryChallenge.id))}
          >
            <Text style={styles.linkText}>Voir le classement →</Text>
          </Pressable>
        </>
      ) : null}

      {tab === 'active' && !loading && !primaryChallenge ? (
        <Text style={styles.empty}>Aucun challenge en cours pour le moment.</Text>
      ) : null}

      {tab === 'past' ? (
        <>
          <SectionTitle title="Challenges passés (entraînement)" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pastRow}>
            {(pastChallenges ?? []).map((challenge, index) => (
              <PastChallengeCard
                key={challenge.id}
                challenge={challenge}
                index={index}
                onPress={() => router.push(DefisRoutes.challengeDetail(challenge.id))}
              />
            ))}
          </ScrollView>
          {!loadingPast && (pastChallenges?.length ?? 0) === 0 ? (
            <Text style={styles.empty}>Aucun challenge passé.</Text>
          ) : null}
        </>
      ) : null}
    </DefisPageShell>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DailyQuizRow({
  quiz,
  isLast,
  onPress,
}: {
  quiz: DailyQuiz;
  isLast: boolean;
  onPress: () => void;
}) {
  const icon = quiz.isPlayed ? '✓' : quiz.isAvailable ? '▶' : '🔒';
  const status = quiz.isPlayed
    ? `${quiz.userScore ?? 0}/${quiz.maxScore} pts`
    : quiz.isAvailable
      ? 'À jouer'
      : 'Demain';

  return (
    <Pressable
      style={[styles.quizRow, !isLast && styles.quizRowBorder, !quiz.isAvailable && styles.quizRowLocked]}
      onPress={onPress}
      disabled={!quiz.isAvailable && !quiz.isPlayed}
    >
      <Text style={styles.quizIcon}>{icon}</Text>
      <Text style={styles.quizTitle}>{quiz.title}</Text>
      <Text style={styles.quizStatus}>{status}</Text>
    </Pressable>
  );
}

function PastChallengeCard({
  challenge,
  index,
  onPress,
}: {
  challenge: WeeklyChallenge;
  index: number;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <Pressable style={styles.pastCard} onPress={onPress}>
        <Text style={styles.pastTitle} numberOfLines={2}>
          {challenge.title}
        </Text>
        <Text style={styles.pastMeta}>Mode entraînement</Text>
      </Pressable>
    </Animated.View>
  );
}

function formatTodayFr(): string {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

const styles = StyleSheet.create({
  loader: { marginVertical: 24 },
  highlightCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 16,
    gap: 10,
  },
  highlightEyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  highlightTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 4,
  },
  ctaText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textLight,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: COLORS.primary,
  },
  statLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  quizRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  quizRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  quizRowLocked: {
    opacity: 0.55,
  },
  quizIcon: {
    width: 24,
    textAlign: 'center',
    fontSize: 14,
  },
  quizTitle: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  quizStatus: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  linkBtn: { alignSelf: 'flex-end' },
  linkText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.primaryDark,
    fontSize: 14,
  },
  empty: {
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
  offlineHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  pastRow: { gap: 12, paddingVertical: 4 },
  pastCard: {
    width: 180,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  pastTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 40,
  },
  pastMeta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.info,
  },
});
