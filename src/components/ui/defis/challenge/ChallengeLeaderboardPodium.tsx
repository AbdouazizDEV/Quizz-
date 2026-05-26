import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { ChallengeLeaderboardEntry } from '@app-types/challenge.types';
import { CHALLENGE_UI } from '@constants/challengeUiTheme';
import { COLORS } from '@constants/Colors';

interface ChallengeLeaderboardPodiumProps {
  entries: ChallengeLeaderboardEntry[];
  maxScore: number;
}

const PODIUM_ORDER = [1, 0, 2] as const;
const HEIGHTS = [88, 112, 72] as const;
const COLORS_PODIUM = [CHALLENGE_UI.podiumSilver, CHALLENGE_UI.podiumGold, CHALLENGE_UI.podiumBronze];

export function ChallengeLeaderboardPodium({ entries, maxScore }: ChallengeLeaderboardPodiumProps) {
  const top3 = entries.slice(0, 3);
  if (top3.length === 0) return null;

  const slots = PODIUM_ORDER.map((idx) => top3[idx] ?? null);

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionLabel}>Podium</Text>
      <View style={styles.podiumRow}>
        {slots.map((entry, visualIdx) => {
          const realIdx = PODIUM_ORDER[visualIdx];
          if (!entry) {
            return <View key={`empty-${visualIdx}`} style={[styles.slot, { flex: 1 }]} />;
          }
          const height = HEIGHTS[visualIdx];
          const barColor = COLORS_PODIUM[visualIdx];
          return (
            <View key={entry.userId} style={styles.slot}>
              <Text style={styles.medal}>{realIdx === 0 ? '🥇' : realIdx === 1 ? '🥈' : '🥉'}</Text>
              <Text style={[styles.name, entry.isCurrentUser && styles.nameYou]} numberOfLines={1}>
                {entry.isCurrentUser ? 'Vous' : entry.displayName}
              </Text>
              <Text style={styles.pts}>{entry.totalScore} pts</Text>
              <LinearGradient
                colors={[barColor, '#FFFFFF']}
                style={[styles.bar, { height }]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  sectionLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: CHALLENGE_UI.navy,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    maxWidth: 120,
  },
  medal: { fontSize: 22 },
  name: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  nameYou: { color: CHALLENGE_UI.goldDark },
  pts: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: CHALLENGE_UI.navy,
  },
  bar: {
    width: '80%',
    minWidth: 48,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 4,
  },
});
