import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import type { LeaderboardItem } from '@app-types/leaderboard.types';
import { bodyText } from '@constants/appText';
import type { PlayerBadgeView } from '@constants/westAfricanBadges';

import { ScoreboardRow } from './ScoreboardRow';

interface ScoreboardListProps {
  items: LeaderboardItem[];
  currentUserId?: string;
  loading: boolean;
  error?: string;
  featuredBadge?: PlayerBadgeView | null;
  onPressAvatar?: (userId: string) => void;
}

export function ScoreboardList({ items, currentUserId, loading, error, featuredBadge, onPressAvatar }: ScoreboardListProps) {
  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>{error}</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>Aucun score disponible pour le moment.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ScoreboardRow
          item={item}
          highlighted={item.id === currentUserId}
          featuredBadge={item.id === currentUserId ? featuredBadge : null}
          onPressAvatar={onPressAvatar}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    width: '100%',
    paddingBottom: 32,
    gap: 0,
  },
  stateContainer: {
    width: '100%',
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  stateText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    ...bodyText,
  },
});

