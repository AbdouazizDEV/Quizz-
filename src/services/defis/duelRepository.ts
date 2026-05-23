import type { DuelSummary } from '@app-types/challenge.types';

import {
  apiAcceptDuel,
  apiCreateFriendDuel,
  apiDeclineDuel,
  apiFetchDuelById,
  apiFetchPendingDuels,
  apiFetchRecentDuels,
} from './duelApi';

export async function fetchPendingDuelsForUser(_userId: string): Promise<DuelSummary[]> {
  return apiFetchPendingDuels();
}

export async function fetchRecentDuelsForUser(_userId: string, _limit = 10): Promise<DuelSummary[]> {
  return apiFetchRecentDuels();
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
