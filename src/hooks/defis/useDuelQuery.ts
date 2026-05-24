import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import type { DuelSummary } from '@app-types/challenge.types';
import type { PaginatedResponse } from '@app-types/pagination.types';
import { fetchDuelById } from '@services/defis/duelRepository';

const DUEL_STALE_MS = 60_000;

function duelsFromCacheEntry(data: unknown): DuelSummary[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as DuelSummary[];

  if (typeof data === 'object' && data !== null && 'items' in data) {
    const items = (data as PaginatedResponse<DuelSummary>).items;
    return Array.isArray(items) ? items : [];
  }

  if (typeof data === 'object' && data !== null && 'pages' in data) {
    const pages = (data as { pages?: unknown[] }).pages;
    if (!Array.isArray(pages)) return [];
    return pages.flatMap((page) => duelsFromCacheEntry(page));
  }

  return [];
}

function findDuelInListsCache(
  queryClient: QueryClient,
  duelId: string,
): DuelSummary | undefined {
  const listQueryKeys = [
    ['duels-recent'],
    ['duels-pending'],
    ['duels-recent-list'],
    ['duels-pending-list'],
  ] as const;

  for (const queryKey of listQueryKeys) {
    const queries = queryClient.getQueriesData({ queryKey });
    for (const [, data] of queries) {
      const hit = duelsFromCacheEntry(data).find((d) => d.id === duelId);
      if (hit) return hit;
    }
  }

  return undefined;
}

export function seedDuelQueryCache(queryClient: QueryClient, duel: DuelSummary): void {
  queryClient.setQueryData<DuelSummary>(['duel', duel.id], duel);
}

export function prefetchDuelQuery(queryClient: QueryClient, duelId: string): Promise<void> {
  return queryClient.prefetchQuery({
    queryKey: ['duel', duelId],
    queryFn: async () => {
      const duel = await fetchDuelById(duelId);
      if (!duel) throw new Error('Duel introuvable.');
      return duel;
    },
    staleTime: DUEL_STALE_MS,
  });
}

export function useDuelQuery(duelId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['duel', duelId],
    queryFn: async () => {
      const duel = await fetchDuelById(duelId);
      if (!duel) throw new Error('Duel introuvable.');
      return duel;
    },
    enabled: Boolean(duelId),
    staleTime: DUEL_STALE_MS,
    retry: 1,
    placeholderData: () =>
      queryClient.getQueryData<DuelSummary>(['duel', duelId]) ??
      findDuelInListsCache(queryClient, duelId),
  });
}

/** Le résultat peut s'afficher : terminé, refusé, expiré ou les deux scores connus. */
export function isDuelResultReady(duel: DuelSummary): boolean {
  return (
    duel.status === 'completed' ||
    duel.status === 'declined' ||
    duel.status === 'expired' ||
    duel.isExpired ||
    (duel.challengerScore !== null && duel.challengedScore !== null)
  );
}

export function shouldOpenDuelResult(duel: DuelSummary): boolean {
  return (
    duel.status === 'completed' ||
    duel.status === 'declined' ||
    duel.status === 'expired' ||
    duel.isExpired ||
    (duel.challengerScore !== null && duel.challengedScore !== null)
  );
}
