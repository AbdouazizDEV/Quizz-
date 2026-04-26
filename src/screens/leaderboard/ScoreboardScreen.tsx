import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScoreboardList } from '@components/ui/leaderboard/ScoreboardList';
import { buildUserProfileHref } from '@constants/Routes';
import { useGlobalLeaderboard } from '@hooks/useGlobalLeaderboard';

export default function ScoreboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { items, me, loading, error, refetch } = useGlobalLeaderboard(100);
  const contentWidth = Math.min(width - 48, 382);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return (
    <View style={styles.root}>
      <View style={[styles.globalContainer, { paddingTop: insets.top + 16 }]}>
        <View style={[styles.secondaryContainer, { width: contentWidth }]}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Retour">
              <Feather name="arrow-left" size={22} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.headerTitle}>Joueurs</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.listContainer}>
            <ScoreboardList
              items={items}
              currentUserId={me?.userId}
              loading={loading}
              error={error ? 'Impossible de charger le classement.' : undefined}
              onPressAvatar={(userId) => router.push(buildUserProfileHref(userId))}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9B800',
  },
  globalContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  secondaryContainer: {
    flex: 1,
    alignSelf: 'stretch',
    gap: 16,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 22,
    height: 22,
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
});

