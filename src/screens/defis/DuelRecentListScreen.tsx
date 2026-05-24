import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { DefisFlatListShell } from '@components/ui/defis/DefisFlatListShell';
import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { RecentDuelRow } from '@components/ui/defis/RecentDuelRow';
import { COLORS } from '@constants/Colors';
import { DUEL_LIST_PAGE_SIZE } from '@constants/duelList';
import { useAuthMe } from '@hooks/useAuthMe';
import { fetchRecentDuelsForUser } from '@services/defis/duelRepository';
import { openDuelFromList } from '@utils/defis/openDuelFromList';

export default function DuelRecentListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['duels-recent-list', userId],
    queryFn: ({ pageParam }) =>
      fetchRecentDuelsForUser(userId, { page: pageParam, limit: DUEL_LIST_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled: Boolean(userId),
  });

  const duels = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const total = data?.pages[0]?.total ?? duels.length;

  return (
    <DefisFlatListShell
      title={`Mes duels récents${total > 0 ? ` (${total})` : ''}`}
      data={duels}
      keyExtractor={(item) => item.id}
      refreshing={isRefetching && !isFetchingNextPage}
      onRefresh={() => void refetch()}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
      }}
      isFetchingNextPage={isFetchingNextPage}
      ListEmptyComponent={
        isLoading ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : (
          <Text style={styles.empty}>Aucun duel terminé pour le moment.</Text>
        )
      }
      renderItem={({ item }) => (
        <View style={styles.item}>
          <DefisSurfaceCard>
            <RecentDuelRow
              duel={item}
              userId={userId}
              isLast
              onPress={() => openDuelFromList(router, queryClient, item)}
            />
          </DefisSurfaceCard>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  item: { marginBottom: 10, width: '100%' },
  empty: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
  },
  loader: { marginVertical: 24 },
});
