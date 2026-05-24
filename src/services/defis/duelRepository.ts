import type { DuelSummary } from '@app-types/challenge.types';
import type { PaginatedResponse } from '@app-types/pagination.types';
import { enqueueApiMutation, runOnlineOrQueue } from '@services/offline/offlineMutation';
import { offlineStore } from '@services/offline/OfflineStore';
import type { OfflineMutationResult } from '@services/offline/types';

import {
  apiAcceptDuel,
  apiCreateFriendDuel,
  apiDeclineDuel,
  apiFetchDuelById,
  apiFetchPendingDuels,
  apiFetchRecentDuels,
  apiSubmitDuelScore,
} from './duelApi';

export async function fetchPendingDuelsForUser(
  _userId: string,
  params?: { page?: number; limit?: number },
): Promise<PaginatedResponse<DuelSummary>> {
  return apiFetchPendingDuels(params);
}

export async function fetchRecentDuelsForUser(
  _userId: string,
  params?: { page?: number; limit?: number },
): Promise<PaginatedResponse<DuelSummary>> {
  return apiFetchRecentDuels(params);
}

export async function fetchDuelById(duelId: string): Promise<DuelSummary | null> {
  return apiFetchDuelById(duelId);
}

export async function createFriendDuel(
  _challengerId: string,
  challengedId: string,
): Promise<OfflineMutationResult<DuelSummary>> {
  return runOnlineOrQueue(
    () => apiCreateFriendDuel(challengedId),
    async () => {
      await enqueueApiMutation({
        method: 'POST',
        path: '/defis/duels',
        body: { challenged_id: challengedId },
      });
    },
  );
}

export async function respondToDuel(
  duelId: string,
  _userId: string,
  accept: boolean,
): Promise<OfflineMutationResult<{ quizId?: string }>> {
  if (accept) {
    return runOnlineOrQueue(
      () => apiAcceptDuel(duelId),
      async () => {
        const path = `/defis/duels/${encodeURIComponent(duelId)}/accept`;
        const alreadyQueued = await offlineStore.hasPendingMutation(path, {});
        if (alreadyQueued) {
          throw new Error('Acceptation déjà en attente de synchronisation.');
        }
        await enqueueApiMutation({ method: 'POST', path, body: {} });
      },
    );
  }

  return runOnlineOrQueue(
    async () => {
      await apiDeclineDuel(duelId);
      return {};
    },
    async () => {
      const path = `/defis/duels/${encodeURIComponent(duelId)}/decline`;
      await enqueueApiMutation({ method: 'POST', path, body: {} });
    },
  );
}

export async function submitDuelScore(
  duelId: string,
  score: number,
): Promise<OfflineMutationResult<DuelSummary>> {
  return runOnlineOrQueue(
    () => apiSubmitDuelScore(duelId, score),
    async () => {
      const path = `/defis/duels/${encodeURIComponent(duelId)}/score`;
      const alreadyQueued = await offlineStore.hasPendingMutation(path, {});
      if (alreadyQueued) {
        throw new Error('Score déjà en attente de synchronisation.');
      }
      await enqueueApiMutation({ method: 'POST', path, body: { score } });
    },
  );
}
