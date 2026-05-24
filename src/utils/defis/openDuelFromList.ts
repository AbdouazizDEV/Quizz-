import type { QueryClient } from '@tanstack/react-query';
import type { Router } from 'expo-router';

import type { DuelSummary } from '@app-types/challenge.types';
import { DefisRoutes } from '@constants/defisRoutes';
import {
  prefetchDuelQuery,
  seedDuelQueryCache,
  shouldOpenDuelResult,
} from '@hooks/defis/useDuelQuery';

export function openDuelFromList(router: Router, queryClient: QueryClient, duel: DuelSummary) {
  if (shouldOpenDuelResult(duel)) {
    seedDuelQueryCache(queryClient, duel);
    void prefetchDuelQuery(queryClient, duel.id);
    router.push(DefisRoutes.duelResult(duel.id));
    return;
  }
  seedDuelQueryCache(queryClient, duel);
  router.push(DefisRoutes.duelDetail(duel.id));
}
