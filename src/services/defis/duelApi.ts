import type { DuelSummary } from '@app-types/challenge.types';
import { apiClient } from '@services/api/apiClient';
import { useAuthStore } from '@stores/authStore';

interface ApiDuelItem {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenger_name: string;
  challenged_name: string;
  challenger_score: number | null;
  challenged_score: number | null;
  status: DuelSummary['status'];
  winner_id: string | null;
  expires_at: string;
  quiz_id: string;
  questions_count: number;
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
    challengerScore: row.challenger_score,
    challengedScore: row.challenged_score,
    status: row.status,
    winnerId: row.winner_id,
    expiresAt: row.expires_at,
    questionsCount: row.questions_count,
    quizId: row.quiz_id,
  };
}

export async function apiFetchPendingDuels(): Promise<DuelSummary[]> {
  const { data } = await apiClient.get<{ items?: ApiDuelItem[] }>('/defis/duels/pending', {
    headers: authHeaders(),
  });
  return (data.items ?? []).map(mapItem);
}

export async function apiFetchRecentDuels(): Promise<DuelSummary[]> {
  const { data } = await apiClient.get<{ items?: ApiDuelItem[] }>('/defis/duels/recent', {
    headers: authHeaders(),
  });
  return (data.items ?? []).map(mapItem);
}

export async function apiFetchDuelById(duelId: string): Promise<DuelSummary | null> {
  const { data } = await apiClient.get<{ item?: ApiDuelItem }>(
    `/defis/duels/${encodeURIComponent(duelId)}`,
    { headers: authHeaders() },
  );
  return data.item ? mapItem(data.item) : null;
}

export async function apiCreateFriendDuel(challengedId: string): Promise<DuelSummary> {
  const { data } = await apiClient.post<{ item?: ApiDuelItem }>(
    '/defis/duels',
    { challenged_id: challengedId },
    { headers: authHeaders() },
  );
  if (!data.item) throw new Error('Réponse serveur invalide.');
  return mapItem(data.item);
}

export async function apiAcceptDuel(duelId: string): Promise<{ quizId: string }> {
  const { data } = await apiClient.post<{ ok: boolean; quiz_id?: string }>(
    `/defis/duels/${encodeURIComponent(duelId)}/accept`,
    {},
    { headers: authHeaders() },
  );
  if (!data.quiz_id) throw new Error('Quiz du duel introuvable.');
  return { quizId: data.quiz_id };
}

export async function apiDeclineDuel(duelId: string): Promise<void> {
  await apiClient.post(
    `/defis/duels/${encodeURIComponent(duelId)}/decline`,
    {},
    { headers: authHeaders() },
  );
}
