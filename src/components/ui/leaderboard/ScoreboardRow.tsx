import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { LeaderboardItem } from '@app-types/leaderboard.types';

interface ScoreboardRowProps {
  item: LeaderboardItem;
  highlighted: boolean;
  onPressAvatar?: (userId: string) => void;
}

export function ScoreboardRow({ item, highlighted, onPressAvatar }: ScoreboardRowProps) {
  return (
    <View style={[styles.row, highlighted && styles.rowHighlighted]}>
      <Text style={[styles.rank, highlighted && styles.rankHighlighted]}>{item.rank}</Text>
      <Pressable
        style={styles.avatarWrap}
        onPress={() => onPressAvatar?.(item.id)}
        accessibilityRole="button"
      >
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarFallback}>{item.displayName[0]?.toUpperCase() ?? '?'}</Text>
        )}
      </Pressable>
      <Text style={[styles.name, highlighted && styles.nameHighlighted]} numberOfLines={1}>
        {item.displayName}
      </Text>
      <Text style={[styles.score, highlighted && styles.scoreHighlighted]}>{item.score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  rowHighlighted: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  rank: {
    width: 26,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 22,
  },
  rankHighlighted: {
    color: '#212121',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#E8EEFF',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarFallback: { color: '#315ECC', fontSize: 18, fontWeight: '800' },
  name: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  nameHighlighted: { color: '#212121' },
  score: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  scoreHighlighted: { color: '#212121' },
});

