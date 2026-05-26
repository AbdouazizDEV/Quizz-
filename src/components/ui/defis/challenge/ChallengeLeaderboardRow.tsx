import { StyleSheet, Text, View } from 'react-native';

import type { ChallengeLeaderboardEntry } from '@app-types/challenge.types';
import { CHALLENGE_UI } from '@constants/challengeUiTheme';
import { COLORS } from '@constants/Colors';

interface ChallengeLeaderboardRowProps {
  entry: ChallengeLeaderboardEntry;
  maxScore: number;
  isLast?: boolean;
}

export function ChallengeLeaderboardRow({ entry, maxScore, isLast }: ChallengeLeaderboardRowProps) {
  const pct = maxScore > 0 ? Math.max(8, (entry.totalScore / maxScore) * 100) : 8;

  return (
    <View style={[styles.row, entry.isCurrentUser && styles.rowYou, !isLast && styles.border]}>
      <View style={[styles.rankBadge, entry.rank <= 3 && styles.rankBadgeTop]}>
        <Text style={styles.rankText}>{entry.rank}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, entry.isCurrentUser && styles.nameYou]} numberOfLines={1}>
            {entry.isCurrentUser ? 'Vous' : entry.displayName}
          </Text>
          <Text style={styles.pts}>{entry.totalScore} pts</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }, entry.isCurrentUser && styles.fillYou]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowYou: {
    backgroundColor: '#FFF8E1',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeTop: {
    backgroundColor: '#FFF3D6',
    borderWidth: 1,
    borderColor: CHALLENGE_UI.heroBorder,
  },
  rankText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: CHALLENGE_UI.navy,
  },
  body: { flex: 1, gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  nameYou: { color: CHALLENGE_UI.navy },
  pts: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: CHALLENGE_UI.goldDark,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#BDBDBD',
  },
  fillYou: {
    backgroundColor: CHALLENGE_UI.gold,
  },
});
