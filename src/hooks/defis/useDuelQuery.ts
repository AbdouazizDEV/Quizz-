import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import type { DuelSummary } from '@app-types/challenge.types';
import { fetchDuelById } from '@services/defis/duelRepository';

const DUEL_STALE_MS = 60_000;

function findDuelInListsCache(
  queryClient: QueryClient,
  duelId: string,
): DuelSummary | undefined {
  const listQueries = queryClient.getQueriesData<DuelSummary[]>({
    queryKey: ['duels-recent'],
  });
  for (const [, items] of listQueries) {
    const hit = items?.find((d) => d.id === duelId);
    if (hit) return hit;
  }

  const pendingQueries = queryClient.getQueriesData<DuelSummary[]>({
    queryKey: ['duels-pending'],
  });
  for (const [, items] of pendingQueries) {
    const hit = items?.find((d) => d.id === duelId);
    if (hit) return hit;
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
