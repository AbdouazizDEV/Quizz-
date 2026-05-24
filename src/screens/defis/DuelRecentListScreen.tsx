import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { DefisFlatListShell } from '@components/ui/defis/DefisFlatListShell';
import { RecentDuelRow } from '@components/ui/defis/RecentDuelRow';
import { COLORS } from '@constants/Colors';
import { DUEL_LIST_PAGE_SIZE } from '@constants/duelList';
import { useAuthMe } from '@hooks/useAuthMe';
import { fetchRecentDuelsForUser } from '@services/defis/duelRepository';
import { openDuelFromList } from '@utils/defis/openDuelFromList';
import { resolveDuelOutcome } from '@utils/defis/resolveDuelOutcome';

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

  const stats = useMemo(() => {
    let victories = 0;
    let defeats = 0;
    let other = 0;
    for (const duel of duels) {
      const outcome = resolveDuelOutcome(duel, userId);
      if (outcome.won) victories += 1;
      else if (outcome.lost) defeats += 1;
      else other += 1;
    }
    return { victories, defeats, other };
  }, [duels, userId]);

  const listHeader = (
    <View style={styles.headerBlock}>
      <LinearGradient
        colors={['#1A1A2E', '#252547']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroEmoji}>⚡</Text>
        <Text style={styles.heroTitle}>Historique des duels</Text>
        <Text style={styles.heroSubtitle}>
          Revivez vos affrontements · Points · Victoires et défaites
        </Text>
        {total > 0 ? (
          <View style={styles.statsRow}>
            <StatChip label="Victoires" value={String(stats.victories)} tone="win" />
            <StatChip label="Défaites" value={String(stats.defeats)} tone="loss" />
            <StatChip label="Autres" value={String(stats.other)} tone="neutral" />
          </View>
        ) : null}
      </LinearGradient>

      {total > 0 ? (
        <View style={styles.legendRow}>
          <LegendDot color={COLORS.success} label="Victoire" />
          <LegendDot color={COLORS.error} label="Défaite" />
          <LegendDot color="#9CA3AF" label="Égalité / autre" />
        </View>
      ) : null}
    </View>
  );

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
      ListHeaderComponent={listHeader}
      ListEmptyComponent={
        isLoading ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>⚔️</Text>
            <Text style={styles.emptyTitle}>Aucun duel terminé</Text>
            <Text style={styles.empty}>
              Lancez un défi depuis l&apos;onglet Duel pour remplir votre historique.
            </Text>
          </View>
        )
      }
      renderItem={({ item }) => (
        <View style={styles.item}>
          <RecentDuelRow
            duel={item}
            userId={userId}
            onPress={() => openDuelFromList(router, queryClient, item)}
          />
        </View>
      )}
    />
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'win' | 'loss' | 'neutral';
}) {
  const colors =
    tone === 'win'
      ? { bg: 'rgba(46, 204, 113, 0.2)', text: '#A8F0C8' }
      : tone === 'loss'
        ? { bg: 'rgba(232, 67, 26, 0.2)', text: '#FFAB91' }
        : { bg: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.85)' };

  return (
    <View style={[styles.statChip, { backgroundColor: colors.bg }]}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    gap: 12,
    marginBottom: 8,
  },
  hero: {
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  heroEmoji: {
    fontSize: 28,
  },
  heroTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  statChip: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
  },
  statLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  item: {
    marginBottom: 12,
    width: '100%',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    color: COLORS.textPrimary,
  },
  empty: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loader: { marginVertical: 24 },
});
