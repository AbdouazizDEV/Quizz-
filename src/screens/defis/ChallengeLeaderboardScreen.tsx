import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import { ChallengeCompetitionHero } from '@components/ui/defis/challenge/ChallengeCompetitionHero';
import { ChallengeLeaderboardPodium } from '@components/ui/defis/challenge/ChallengeLeaderboardPodium';
import { ChallengeLeaderboardRow } from '@components/ui/defis/challenge/ChallengeLeaderboardRow';
import { ChallengeMyRankCard } from '@components/ui/defis/challenge/ChallengeMyRankCard';
import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { CHALLENGE_UI } from '@constants/challengeUiTheme';
import { COLORS } from '@constants/Colors';
import { useAuthMe } from '@hooks/useAuthMe';
import { fetchChallengeLeaderboard } from '@services/defis/challengeRepository';

export default function ChallengeLeaderboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challengeId = typeof id === 'string' ? id : '';
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['challenge-leaderboard', challengeId, userId],
    queryFn: () => fetchChallengeLeaderboard(challengeId, userId),
    enabled: Boolean(challengeId && userId),
  });

  const maxScore = data?.entries[0]?.totalScore ?? 1;
  const restEntries = data?.entries.slice(3) ?? [];

  return (
    <DefisPageShell title="Classement">
      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : isError || !data ? (
        <View style={styles.emptyWrap}>
          <Feather name="alert-circle" size={32} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Impossible de charger le classement.</Text>
          <Pressable onPress={() => void refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <Animated.View entering={FadeInDown.duration(350)} style={styles.content}>
          <ChallengeCompetitionHero
            title={data.challengeTitle}
            endsAt={data.endsAt}
            rewardText={data.rewardText}
            userRank={data.currentUser?.rank ?? null}
            userScore={data.currentUser?.totalScore ?? 0}
          />

          {data.currentUser ? (
            <ChallengeMyRankCard
              rank={data.currentUser.rank}
              totalScore={data.currentUser.totalScore}
              pointsToNextRank={data.currentUser.pointsToNextRank}
            />
          ) : null}

          {data.entries.length === 0 ? (
            <DefisSurfaceCard style={styles.emptyCard}>
              <Feather name="users" size={28} color={CHALLENGE_UI.gold} />
              <Text style={styles.emptyListText}>
                Aucun score pour l&apos;instant — soyez le premier à jouer un quiz du challenge !
              </Text>
            </DefisSurfaceCard>
          ) : (
            <>
              {data.entries.length >= 1 ? (
                <ChallengeLeaderboardPodium entries={data.entries} maxScore={maxScore} />
              ) : null}

              {restEntries.length > 0 ? (
                <View style={styles.listSection}>
                  <View style={styles.sectionHead}>
                    <Feather name="list" size={16} color={CHALLENGE_UI.navy} />
                    <Text style={styles.sectionTitle}>Classement complet</Text>
                  </View>
                  <DefisSurfaceCard style={styles.listCard}>
                    {restEntries.map((entry, index) => (
                      <ChallengeLeaderboardRow
                        key={entry.userId}
                        entry={entry}
                        maxScore={maxScore}
                        isLast={index === restEntries.length - 1}
                      />
                    ))}
                  </DefisSurfaceCard>
                </View>
              ) : null}
            </>
          )}
        </Animated.View>
      )}
    </DefisPageShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, width: '100%' },
  loader: { marginTop: 32 },
  emptyWrap: { alignItems: 'center', gap: 12, marginTop: 32, paddingHorizontal: 16 },
  emptyText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: CHALLENGE_UI.gold,
  },
  retryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: CHALLENGE_UI.navy,
  },
  emptyCard: { alignItems: 'center', gap: 12, paddingVertical: 28 },
  emptyListText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  listSection: { gap: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: CHALLENGE_UI.navy,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  listCard: {
    borderColor: CHALLENGE_UI.heroBorder,
    borderWidth: 1,
  },
});
