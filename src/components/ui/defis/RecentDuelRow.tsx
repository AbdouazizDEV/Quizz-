import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@constants/Colors';
import type { DuelSummary } from '@app-types/challenge.types';
import { getUserAvatarUri } from '@utils/getUserAvatarUri';
import {
  resolveDuelOutcome,
  type DuelOutcomeTone,
} from '@utils/defis/resolveDuelOutcome';

interface RecentDuelRowProps {
  duel: DuelSummary;
  userId: string;
  onPress: () => void;
}

const TONE_STYLES: Record<
  DuelOutcomeTone,
  { accent: string; badgeBg: string; badgeText: string; pointsBg: string }
> = {
  victory: {
    accent: COLORS.success,
    badgeBg: 'rgba(46, 204, 113, 0.15)',
    badgeText: '#1E8449',
    pointsBg: 'rgba(46, 204, 113, 0.12)',
  },
  defeat: {
    accent: COLORS.error,
    badgeBg: 'rgba(232, 67, 26, 0.12)',
    badgeText: COLORS.error,
    pointsBg: 'rgba(232, 67, 26, 0.08)',
  },
  draw: {
    accent: '#6B6B7B',
    badgeBg: 'rgba(107, 107, 123, 0.12)',
    badgeText: '#4A4A5E',
    pointsBg: 'rgba(107, 107, 123, 0.1)',
  },
  neutral: {
    accent: '#9CA3AF',
    badgeBg: 'rgba(156, 163, 175, 0.15)',
    badgeText: '#6B7280',
    pointsBg: 'rgba(156, 163, 175, 0.1)',
  },
  expired: {
    accent: COLORS.warning,
    badgeBg: 'rgba(245, 166, 35, 0.18)',
    badgeText: '#B7791F',
    pointsBg: 'rgba(245, 166, 35, 0.1)',
  },
};

export function RecentDuelRow({ duel, userId, onPress }: RecentDuelRowProps) {
  const isChallenger = duel.challengerId === userId;
  const opponentName = isChallenger ? duel.challengedName : duel.challengerName;
  const opponentId = isChallenger ? duel.challengedId : duel.challengerId;
  const opponentAvatar = isChallenger ? duel.challengedAvatarUrl : duel.challengerAvatarUrl;
  const outcome = resolveDuelOutcome(duel, userId);
  const tone = TONE_STYLES[outcome.tone];

  const myScore = isChallenger ? duel.challengerScore : duel.challengedScore;
  const oppScore = isChallenger ? duel.challengedScore : duel.challengerScore;
  const hasScores = myScore !== null && oppScore !== null;

  return (
    <Pressable
      style={[styles.card, { borderLeftColor: tone.accent }]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Image
        source={{ uri: getUserAvatarUri(opponentId, opponentAvatar) }}
        style={styles.avatar}
      />

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {opponentName}
        </Text>

        {hasScores ? (
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreNum, outcome.won && styles.scoreNumWin]}>{myScore}</Text>
            <Text style={styles.scoreSep}>vs</Text>
            <Text style={styles.scoreNum}>{oppScore}</Text>
          </View>
        ) : (
          <Text style={styles.noScore}>Match non disputé</Text>
        )}

        <View style={[styles.badge, { backgroundColor: tone.badgeBg }]}>
          <Text style={styles.badgeIcon}>{outcome.icon}</Text>
          <Text style={[styles.badgeLabel, { color: tone.badgeText }]}>{outcome.label}</Text>
        </View>
      </View>

      <View style={[styles.pointsChip, { backgroundColor: tone.pointsBg }]}>
        <Text style={[styles.pointsValue, { color: tone.badgeText }]}>{outcome.points}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#10173B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.border,
    borderWidth: 2,
    borderColor: 'rgba(245, 166, 35, 0.35)',
  },
  body: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  name: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreNum: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  scoreNumWin: {
    color: COLORS.success,
  },
  scoreSep: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  noScore: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgeLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  pointsChip: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    textAlign: 'center',
  },
});
