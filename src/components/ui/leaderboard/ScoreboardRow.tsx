import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { LeaderboardItem } from '@app-types/leaderboard.types';
import { BadgeChip } from '@components/ui/badges/BadgeChip';
import { LevelBadge } from '@components/ui/home/LevelBadge';
import { titleText } from '@constants/appText';
import type { PlayerBadgeView } from '@constants/westAfricanBadges';
import { levelCodeFromScore } from '@utils/levelDisplay';

interface ScoreboardRowProps {
  item: LeaderboardItem;
  highlighted: boolean;
  featuredBadge?: PlayerBadgeView | null;
  onPressAvatar?: (userId: string) => void;
}

export function ScoreboardRow({ item, highlighted, featuredBadge, onPressAvatar }: ScoreboardRowProps) {
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
      <View style={styles.nameCol}>
        <Text style={[styles.name, highlighted && styles.nameHighlighted]} numberOfLines={1}>
          {item.displayName}
        </Text>
        {highlighted && featuredBadge ? <BadgeChip badge={featuredBadge} /> : null}
      </View>
      <LevelBadge code={levelCodeFromScore(item.score)} compact />
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
  nameCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  rank: {
    width: 26,
    textAlign: 'center',
    color: '#FFFFFF',
    ...titleText,
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
  avatarFallback: { color: '#315ECC', fontSize: 18, ...titleText },
  name: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 17,
    ...titleText,
  },
  nameHighlighted: { color: '#212121' },
  score: {
    color: '#FFFFFF',
    fontSize: 20,
    ...titleText,
  },
  scoreHighlighted: { color: '#212121' },
});

