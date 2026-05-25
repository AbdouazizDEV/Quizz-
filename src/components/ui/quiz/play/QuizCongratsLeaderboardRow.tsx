import { Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { QuizLeaderboardEntry } from '@app-types/quizPlay.types';

interface QuizCongratsLeaderboardRowProps {
  entry: QuizLeaderboardEntry;
  fonts: { bold?: string; semiBold?: string };
}

function rankMedal(rank: number): { icon: 'award'; color: string } | null {
  if (rank === 1) return { icon: 'award', color: '#D4AF37' };
  if (rank === 2) return { icon: 'award', color: '#9CA3AF' };
  if (rank === 3) return { icon: 'award', color: '#CD7F32' };
  return null;
}

export function QuizCongratsLeaderboardRow({ entry, fonts }: QuizCongratsLeaderboardRowProps) {
  const medal = rankMedal(entry.rank);
  const highlighted = entry.isCurrentUser;

  return (
    <View style={[styles.row, highlighted && styles.rowHighlighted]}>
      <View style={styles.rankCol}>
        {medal ? (
          <Feather name={medal.icon} size={20} color={medal.color} />
        ) : (
          <Text style={[styles.rank, fonts.bold && { fontFamily: fonts.bold }]}>{entry.rank}</Text>
        )}
      </View>
      <View style={styles.avatarWrap}>
        {entry.avatarUrl ? (
          <Image source={{ uri: entry.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={[styles.avatarFallback, fonts.bold && { fontFamily: fonts.bold }]}>
            {entry.displayName[0]?.toUpperCase() ?? '?'}
          </Text>
        )}
      </View>
      <Text
        style={[styles.name, highlighted && styles.nameHighlighted, fonts.semiBold && { fontFamily: fonts.semiBold }]}
        numberOfLines={1}
      >
        {entry.displayName}
        {highlighted ? ' (toi)' : ''}
      </Text>
      <Text style={[styles.pts, highlighted && styles.ptsHighlighted, fonts.bold && { fontFamily: fonts.bold }]}>
        {entry.score}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
    gap: 10,
  },
  rowHighlighted: {
    backgroundColor: '#FFF8E1',
    borderBottomColor: '#FFE082',
  },
  rankCol: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: { fontSize: 16, fontWeight: '800', color: '#212121' },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarFallback: { fontSize: 16, fontWeight: '800', color: '#315ECC' },
  name: { flex: 1, fontSize: 16, color: '#212121', fontWeight: '600' },
  nameHighlighted: { color: '#1F2261', fontWeight: '800' },
  pts: { fontSize: 16, fontWeight: '800', color: '#212121', minWidth: 48, textAlign: 'right' },
  ptsHighlighted: { color: '#FFB703' },
});
