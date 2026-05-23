import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { CountdownTimer } from '@components/atoms/CountdownTimer';
import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { COLORS } from '@constants/Colors';
import { useAuthMe } from '@hooks/useAuthMe';
import { fetchChallengeLeaderboard } from '@services/defis/challengeRepository';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function ChallengeLeaderboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challengeId = typeof id === 'string' ? id : '';
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['challenge-leaderboard', challengeId, userId],
    queryFn: () => fetchChallengeLeaderboard(challengeId, userId),
    enabled: Boolean(challengeId && userId),
  });

  const maxScore = data?.entries[0]?.totalScore ?? 1;

  return (
    <DefisPageShell title="Classement">
      {isLoading || !data ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : (
        <>
          <Text style={styles.subtitle}>{data.challengeTitle}</Text>

          {data.currentUser ? (
            <View style={styles.myRankCard}>
              <Text style={styles.myRankEyebrow}>Mon rang</Text>
              <Text style={styles.myRankValue}>
                {MEDALS[data.currentUser.rank - 1] ?? `#${data.currentUser.rank}`} #{data.currentUser.rank} —{' '}
                {data.currentUser.totalScore} points
              </Text>
              {data.currentUser.pointsToNextRank ? (
                <Text style={styles.myRankHint}>
                  Il vous manque {data.currentUser.pointsToNextRank} pts pour atteindre la{' '}
                  {data.currentUser.rank - 1}e place
                </Text>
              ) : null}
            </View>
          ) : null}

          <DefisSurfaceCard>
            {data.entries.map((entry) => (
              <View
                key={entry.userId}
                style={[styles.row, entry.isCurrentUser && styles.rowHighlight]}
              >
                <Text style={styles.rank}>
                  {MEDALS[entry.rank - 1] ?? `${entry.rank}.`}
                </Text>
                <Text style={styles.name} numberOfLines={1}>
                  {entry.isCurrentUser ? 'Vous' : entry.displayName}
                </Text>
                <Text style={styles.points}>{entry.totalScore} pts</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.max(8, (entry.totalScore / maxScore) * 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </DefisSurfaceCard>

          <CountdownTimer endsAt={data.endsAt} />
          {data.rewardText ? <Text style={styles.reward}>🎁 Récompense : {data.rewardText}</Text> : null}
        </>
      )}
    </DefisPageShell>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 32 },
  subtitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  myRankCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  myRankEyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  myRankValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  myRankHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  rowHighlight: {
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rank: { width: 28, fontSize: 16 },
  name: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.textPrimary,
    minWidth: 100,
  },
  points: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.textSecondary,
    width: 56,
    textAlign: 'right',
  },
  barTrack: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  reward: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
