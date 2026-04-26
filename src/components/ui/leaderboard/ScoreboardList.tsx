import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import type { LeaderboardItem } from '@app-types/leaderboard.types';
import { ScoreboardRow } from './ScoreboardRow';

interface ScoreboardListProps {
  items: LeaderboardItem[];
  currentUserId?: string;
  loading: boolean;
  error?: string;
  onPressAvatar?: (userId: string) => void;
}

export function ScoreboardList({ items, currentUserId, loading, error, onPressAvatar }: ScoreboardListProps) {
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
    fontWeight: '600',
  },
});

