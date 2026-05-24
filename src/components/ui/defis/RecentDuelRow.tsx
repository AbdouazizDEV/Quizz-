import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@constants/Colors';
import type { DuelSummary } from '@app-types/challenge.types';
import { resolveDuelOutcome } from '@utils/defis/resolveDuelOutcome';

interface RecentDuelRowProps {
  duel: DuelSummary;
  userId: string;
  isLast: boolean;
  onPress: () => void;
}

export function RecentDuelRow({ duel, userId, isLast, onPress }: RecentDuelRowProps) {
  const opponent = duel.challengerId === userId ? duel.challengedName : duel.challengerName;
  const outcome = resolveDuelOutcome(duel, userId);
  const isChallenger = duel.challengerId === userId;
  const myScore = isChallenger ? duel.challengerScore : duel.challengedScore;
  const oppScore = isChallenger ? duel.challengedScore : duel.challengerScore;
  const scoreLine = myScore !== null && oppScore !== null ? `${myScore} - ${oppScore} pts` : null;

  return (
    <Pressable style={[styles.row, !isLast && styles.rowBorder]} onPress={onPress}>
      <View style={styles.main}>
        <Text style={styles.name}>{opponent}</Text>
        {scoreLine ? <Text style={styles.scoreLine}>{scoreLine}</Text> : null}
      </View>
      <Text style={[styles.outcome, outcome.won && styles.win, outcome.lost && styles.loss]}>
        {outcome.label}
      </Text>
      <Text style={styles.points}>{outcome.points}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  scoreLine: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  name: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  outcome: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  win: { color: COLORS.success },
  loss: { color: COLORS.error },
  points: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.primary,
    width: 56,
    textAlign: 'right',
  },
});
