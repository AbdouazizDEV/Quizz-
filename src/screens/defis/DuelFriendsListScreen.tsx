import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { DefisFlatListShell } from '@components/ui/defis/DefisFlatListShell';
import { DuelFriendRow } from '@components/ui/defis/DuelFriendRow';
import { DuelSentModal } from '@components/ui/defis/DuelSentModal';
import { COLORS } from '@constants/Colors';
import { DefisRoutes } from '@constants/defisRoutes';
import { DUEL_LIST_PAGE_SIZE } from '@constants/duelList';
import { useAuthMe } from '@hooks/useAuthMe';
import type { DuelSummary } from '@app-types/challenge.types';
import { useAppError } from '@providers/AppErrorProvider';
import { createFriendDuel } from '@services/defis/duelRepository';
import { fetchFriendsForDuelPaginated } from '@services/defis/duelFriendsSearch';

export default function DuelFriendsListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAppError } = useAppError();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';
  const [search, setSearch] = useState('');
  const [sentModal, setSentModal] = useState<{
    duel: DuelSummary;
    friendName: string;
  } | null>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
    isError,
  } = useInfiniteQuery({
    queryKey: ['duel-friends-list', userId, search.trim()],
    queryFn: ({ pageParam }) =>
      fetchFriendsForDuelPaginated(search, pageParam, DUEL_LIST_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled: Boolean(userId),
  });

  const friends = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const total = data?.pages[0]?.total ?? friends.length;

  const refreshDuels = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['duels-pending'] });
    await queryClient.invalidateQueries({ queryKey: ['duels-recent'] });
  }, [queryClient]);

  const onChallengeFriend = async (friendName: string, friendId: string) => {
    if (!userId) return;
    try {
      const result = await createFriendDuel(userId, friendId);
      await refreshDuels();
      if (result.queued) {
        Alert.alert('Duel', 'Défi enregistré — synchronisation à la reconnexion.');
        return;
      }
      if (result.data) {
        setSentModal({ duel: result.data, friendName });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de créer le duel.';
      showAppError(message, { title: 'Duel' });
    }
  };

  return (
    <>
      <DuelSentModal
        visible={sentModal !== null}
        friendName={sentModal?.friendName ?? ''}
        questionsCount={sentModal?.duel.questionsCount ?? 15}
        expiresAt={sentModal?.duel.expiresAt ?? new Date().toISOString()}
        onLater={() => setSentModal(null)}
        onPlayNow={() => {
          const duelId = sentModal?.duel.id;
          setSentModal(null);
          if (duelId) router.push(DefisRoutes.duelDetail(duelId));
        }}
      />

      <DefisFlatListShell
        title={`Défier un ami${total > 0 ? ` (${total})` : ''}`}
        data={friends}
        keyExtractor={(item) => item.id}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => void refetch()}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        isFetchingNextPage={isFetchingNextPage}
        ListHeaderComponent={
          <TextInput
            style={styles.search}
            placeholder="🔍 Rechercher un ami..."
            placeholderTextColor={COLORS.textSecondary}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={COLORS.primary} style={styles.loader} />
          ) : isError ? (
            <Text style={styles.empty}>Impossible de charger vos amis.</Text>
          ) : (
            <Text style={styles.empty}>
              {search.trim() ? 'Aucun ami trouvé pour cette recherche.' : 'Aucun ami dans votre réseau.'}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <DuelFriendRow
              friend={item}
              onChallenge={() => void onChallengeFriend(item.displayName, item.id)}
            />
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  item: { width: '100%' },
  empty: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
  },
  loader: { marginVertical: 24 },
});
