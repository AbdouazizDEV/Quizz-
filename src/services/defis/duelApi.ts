import type { DuelSummary } from '@app-types/challenge.types';
import type { PaginatedResponse } from '@app-types/pagination.types';
import { apiClient } from '@services/api/apiClient';
import { useAuthStore } from '@stores/authStore';
import { extractApiError } from '@utils/extractApiError';

interface ApiDuelItem {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenger_name: string;
  challenged_name: string;
  challenger_avatar_url?: string | null;
  challenged_avatar_url?: string | null;
  challenger_total_score?: number;
  challenged_total_score?: number;
  challenger_score: number | null;
  challenged_score: number | null;
  status: DuelSummary['status'];
  winner_id: string | null;
  expires_at: string;
  quiz_id: string;
  questions_count: number;
  phase: DuelSummary['phase'];
  is_expired?: boolean;
}

function authHeaders(): { Authorization: string } {
  const token = useAuthStore.getState().token?.trim();
  if (!token) throw new Error('Utilisateur non connecté.');
  return { Authorization: `Bearer ${token}` };
}

function mapItem(row: ApiDuelItem): DuelSummary {
  return {
    id: row.id,
    challengerId: row.challenger_id,
    challengedId: row.challenged_id,
    challengerName: row.challenger_name,
    challengedName: row.challenged_name,
    challengerAvatarUrl: row.challenger_avatar_url ?? null,
    challengedAvatarUrl: row.challenged_avatar_url ?? null,
    challengerTotalScore: row.challenger_total_score ?? 0,
    challengedTotalScore: row.challenged_total_score ?? 0,
    challengerScore: row.challenger_score,
    challengedScore: row.challenged_score,
    status: row.status,
    winnerId: row.winner_id,
    expiresAt: row.expires_at,
    questionsCount: row.questions_count,
    quizId: row.quiz_id,
    phase: row.phase,
    isExpired: row.is_expired ?? (row.phase === 'expired' || row.status === 'expired'),
  };
}

function mapPaginated(items: ApiDuelItem[] | undefined, meta: {
  page?: number;
  limit?: number;
  total?: number;
  has_more?: boolean;
}, fallbackLimit: number): PaginatedResponse<DuelSummary> {
  const mapped = (items ?? []).map(mapItem);
  return {
    items: mapped,
    page: meta.page ?? 1,
    limit: meta.limit ?? fallbackLimit,
    total: meta.total ?? mapped.length,
    hasMore: meta.has_more ?? false,
  };
}

export async function apiFetchPendingDuels(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<DuelSummary>> {
  const limit = params?.limit ?? 20;
  const { data } = await apiClient.get<{
    items?: ApiDuelItem[];
    page?: number;
    limit?: number;
    total?: number;
    has_more?: boolean;
  }>('/defis/duels/pending', {
    headers: authHeaders(),
    params: { page: params?.page ?? 1, limit },
  });
  return mapPaginated(data.items, data, limit);
}

export async function apiFetchRecentDuels(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<DuelSummary>> {
  const limit = params?.limit ?? 20;
  const { data } = await apiClient.get<{
    items?: ApiDuelItem[];
    page?: number;
    limit?: number;
    total?: number;
    has_more?: boolean;
  }>('/defis/duels/recent', {
    headers: authHeaders(),
    params: { page: params?.page ?? 1, limit },
  });
  return mapPaginated(data.items, data, limit);
}

export async function apiFetchDuelById(duelId: string): Promise<DuelSummary | null> {
  const { data } = await apiClient.get<{ item?: ApiDuelItem }>(
    `/defis/duels/${encodeURIComponent(duelId)}`,
    { headers: authHeaders() },
  );
  return data.item ? mapItem(data.item) : null;
}

export async function apiCreateFriendDuel(challengedId: string): Promise<DuelSummary> {
  try {
    const { data } = await apiClient.post<{ item?: ApiDuelItem }>(
      '/defis/duels',
      { challenged_id: challengedId },
      { headers: authHeaders() },
    );
    if (!data.item) throw new Error('Réponse serveur invalide.');
    return mapItem(data.item);
  } catch (error) {
    throw new Error(extractApiError(error, 'Impossible de créer le duel.'));
  }
}

export async function apiAcceptDuel(duelId: string): Promise<{ quizId: string }> {
  try {
    const { data } = await apiClient.post<{ ok: boolean; quiz_id?: string }>(
      `/defis/duels/${encodeURIComponent(duelId)}/accept`,
      {},
      { headers: authHeaders() },
    );
    if (!data.quiz_id) throw new Error('Quiz du duel introuvable.');
    return { quizId: data.quiz_id };
  } catch (error) {
    throw new Error(extractApiError(error, 'Impossible d\'accepter le duel.'));
  }
}

export async function apiDeclineDuel(duelId: string): Promise<void> {
  try {
    await apiClient.post(
      `/defis/duels/${encodeURIComponent(duelId)}/decline`,
      {},
      { headers: authHeaders() },
    );
  } catch (error) {
    throw new Error(extractApiError(error, 'Impossible de refuser le duel.'));
  }
}
