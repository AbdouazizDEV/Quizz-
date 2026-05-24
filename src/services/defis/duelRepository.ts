import type { DuelSummary } from '@app-types/challenge.types';
import type { PaginatedResponse } from '@app-types/pagination.types';

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

export async function createFriendDuel(_challengerId: string, challengedId: string): Promise<DuelSummary> {
  return apiCreateFriendDuel(challengedId);
}

export async function respondToDuel(duelId: string, _userId: string, accept: boolean): Promise<void> {
  if (accept) {
    await apiAcceptDuel(duelId);
    return;
  }
  await apiDeclineDuel(duelId);
}

export async function submitDuelScore(duelId: string, score: number): Promise<DuelSummary> {
  return apiSubmitDuelScore(duelId, score);
}
