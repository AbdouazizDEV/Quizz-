import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { ActiveDuelCard } from '@components/ui/defis/ActiveDuelCard';
import { DefisFlatListShell } from '@components/ui/defis/DefisFlatListShell';
import { COLORS } from '@constants/Colors';
import { DefisRoutes } from '@constants/defisRoutes';
import { DUEL_LIST_PAGE_SIZE } from '@constants/duelList';
import { useAuthMe } from '@hooks/useAuthMe';
import { useAppError } from '@providers/AppErrorProvider';
import { fetchPendingDuelsForUser, respondToDuel } from '@services/defis/duelRepository';

export default function DuelPendingListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAppError } = useAppError();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';
  const [respondingDuelId, setRespondingDuelId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['duels-pending-list', userId],
    queryFn: ({ pageParam }) =>
      fetchPendingDuelsForUser(userId, { page: pageParam, limit: DUEL_LIST_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled: Boolean(userId),
  });

  const duels = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const total = data?.pages[0]?.total ?? duels.length;

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['duels-pending'] });
    await queryClient.invalidateQueries({ queryKey: ['duels-pending-list'] });
    await queryClient.invalidateQueries({ queryKey: ['duels-recent'] });
  }, [queryClient]);

  const onRespond = async (duelId: string, accept: boolean, challengerName: string) => {
    if (!userId || respondingDuelId) return;
    setRespondingDuelId(duelId);
    try {
      const result = await respondToDuel(duelId, userId, accept);
      await invalidate();
      if (result.queued) {
        Alert.alert(
          'Duel',
          accept
            ? 'Acceptation enregistrée — le duel sera disponible à la reconnexion.'
            : 'Refus enregistré — synchronisation à la reconnexion.',
        );
        return;
      }
      if (accept) {
        Alert.alert('Défi accepté', `Le duel contre ${challengerName} est lancé. Bonne chance !`);
        router.push(DefisRoutes.duelDetail(duelId));
      } else {
        Alert.alert('Défi refusé', `${challengerName} sera notifié de votre refus.`);
      }
    } catch (error) {
      showAppError(error instanceof Error ? error.message : 'Une erreur est survenue.', {
        title: 'Duel',
        onRetry: () => void onRespond(duelId, accept, challengerName),
      });
    } finally {
      setRespondingDuelId(null);
    }
  };

  return (
    <DefisFlatListShell
      title={`Duels en attente${total > 0 ? ` (${total})` : ''}`}
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
          <Text style={styles.empty}>Aucun duel en attente.</Text>
        )
      }
      renderItem={({ item }) => (
        <View style={styles.item}>
          <ActiveDuelCard
            duel={item}
            userId={userId}
            busy={respondingDuelId === item.id}
            onRespond={onRespond}
            onOpen={() => router.push(DefisRoutes.duelDetail(item.id))}
          />
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
