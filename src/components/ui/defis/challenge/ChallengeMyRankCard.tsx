import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { CHALLENGE_UI } from '@constants/challengeUiTheme';
import { COLORS } from '@constants/Colors';

interface ChallengeMyRankCardProps {
  rank: number;
  totalScore: number;
  pointsToNextRank: number | null;
}

const MEDAL_ICON = ['award', 'award', 'award'] as const;

export function ChallengeMyRankCard({ rank, totalScore, pointsToNextRank }: ChallengeMyRankCardProps) {
  const isTopThree = rank <= 3;

  return (
    <LinearGradient
      colors={isTopThree ? ['#FFF8E1', '#FFE082', '#FFF3D6'] : [COLORS.primaryLight, '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Text style={styles.eyebrow}>Mon classement</Text>
        <View style={styles.liveDot}>
          <View style={styles.liveInner} />
          <Text style={styles.liveText}>En direct</Text>
        </View>
      </View>
      <View style={styles.rankRow}>
        <View style={styles.medalCircle}>
          <Feather
            name={MEDAL_ICON[Math.min(rank - 1, 2)] ?? 'bar-chart-2'}
            size={22}
            color={CHALLENGE_UI.navy}
          />
        </View>
        <View style={styles.rankCol}>
          <Text style={styles.rankBig}>#{rank}</Text>
          <Text style={styles.scoreLine}>{totalScore} points</Text>
        </View>
      </View>
      {pointsToNextRank != null && pointsToNextRank > 0 ? (
        <View style={styles.chaseRow}>
          <Feather name="trending-up" size={16} color={CHALLENGE_UI.goldDark} />
          <Text style={styles.chaseText}>
            Plus que <Text style={styles.chaseBold}>{pointsToNextRank} pts</Text> pour la {rank - 1}
            {rank - 1 === 1 ? 're' : 'e'} place
          </Text>
        </View>
      ) : rank === 1 ? (
        <Text style={styles.leaderText}>Vous menez la course — continuez comme ça !</Text>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 2,
    borderColor: CHALLENGE_UI.gold,
    shadowColor: CHALLENGE_UI.cardShadow,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: CHALLENGE_UI.navy,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  liveDot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
  },
  liveText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: '#E53935',
    textTransform: 'uppercase',
  },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  medalCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CHALLENGE_UI.heroBorder,
  },
  rankCol: { gap: 2 },
  rankBig: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 32,
    color: CHALLENGE_UI.navy,
    lineHeight: 36,
  },
  scoreLine: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  chaseRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chaseText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  chaseBold: {
    fontFamily: 'Nunito_800ExtraBold',
    color: CHALLENGE_UI.navy,
  },
  leaderText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: CHALLENGE_UI.goldDark,
  },
});
