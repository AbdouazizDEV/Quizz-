import type { CompetitionSummary } from '@app-types/challenge.types';
import { apiClient } from '@services/api/apiClient';
import {
  applyOptimisticRegistration,
  validateRegistrationFromCache,
} from '@services/offline/competitionCacheOptimistic';
import {
  competitionDetailCacheKey,
  competitionsListCacheKey,
  enqueueApiMutation,
  fetchNetworkOnline,
  offlineStore,
  readWithOfflineCache,
} from '@services/offline';
import { extractApiError } from '@utils/extractApiError';

import {
  asRecord,
  authHeaders,
  isConflict,
  readFiniteNumber,
  readString,
  throwIfNestRouteMissing,
  unwrapItems,
  unwrapObject,
} from './nestDefisHelpers';

export interface CompetitionMutationResult {
  queued: boolean;
}

export type CompetitionTab = 'inscriptions' | 'en_cours' | 'fin';

function mapStatus(value: unknown): CompetitionSummary['status'] {
  const raw = readString(value)?.toLowerCase() ?? '';
  if (raw === 'scheduled' || raw === 'inscriptions' || raw === 'open') return 'scheduled';
  if (raw === 'live' || raw === 'en_cours' || raw === 'ongoing') return 'live';
  if (raw === 'completed' || raw === 'fin' || raw === 'termine' || raw === 'terminé') return 'completed';
  if (raw === 'cancelled' || raw === 'canceled') return 'cancelled';
  return 'draft';
}

function mapCompetition(row: Record<string, unknown>): CompetitionSummary {
  return {
    id: readString(row.id) ?? '',
    title: readString(row.title) ?? 'Tournoi',
    description: readString(row.description),
    categoryName: readString(row.category_name) ?? readString(row.categoryName),
    status: mapStatus(row.status),
    startsAt: readString(row.starts_at) ?? readString(row.startsAt),
    endsAt: readString(row.ends_at) ?? readString(row.endsAt),
    rewardText: readString(row.reward_text) ?? readString(row.rewardText),
    registeredCount: readFiniteNumber(row.registered_count) ?? readFiniteNumber(row.registered) ?? 0,
    maxParticipants: readFiniteNumber(row.max_participants) ?? 32,
    isRegistered: row.is_registered === true || row.isRegistered === true,
  };
}

async function loadCompetitionsByTab(tab: CompetitionTab): Promise<CompetitionSummary[]> {
  try {
    const { data } = await apiClient.get('/defis/competitions', {
      headers: authHeaders(),
      params: { tab },
    });
    return unwrapItems(data)
      .map(mapCompetition)
      .filter((item) => item.id);
  } catch (error) {
    throwIfNestRouteMissing(error, `GET /api/v1/defis/competitions?tab=${tab}`);
    throw new Error(extractApiError(error, 'Impossible de charger les tournois.'));
  }
}

async function loadCompetitionById(competitionId: string): Promise<CompetitionSummary | null> {
  try {
    const { data } = await apiClient.get(`/defis/competitions/${encodeURIComponent(competitionId)}`, {
      headers: authHeaders(),
    });
    const row = unwrapObject(data, ['competition', 'item', 'data']);
    return row ? mapCompetition(row) : null;
  } catch (error) {
    throwIfNestRouteMissing(error, `GET /api/v1/defis/competitions/${competitionId}`);
    throw new Error(extractApiError(error, 'Impossible de charger ce tournoi.'));
  }
}

function registerPath(competitionId: string): string {
  return `/defis/competitions/${encodeURIComponent(competitionId)}/register`;
}

function unregisterPath(competitionId: string): string {
  return `/defis/competitions/${encodeURIComponent(competitionId)}/unregister`;
}

function isTournamentFull(error: unknown): boolean {
  const message = extractApiError(error, '').toLowerCase();
  return (
    isConflict(error) &&
    (message.includes('maximum') ||
      message.includes('plein') ||
      message.includes('complet') ||
      message.includes('full') ||
      message.includes('participants'))
  );
}

export async function fetchCompetitionsByTab(
  tab: CompetitionTab,
  userId: string,
): Promise<CompetitionSummary[]> {
  return readWithOfflineCache({
    cacheKey: competitionsListCacheKey(tab, userId),
    source: 'api',
    fetchOnline: () => loadCompetitionsByTab(tab),
  });
}

export async function fetchCompetitionById(
  competitionId: string,
  userId: string,
): Promise<CompetitionSummary | null> {
  return readWithOfflineCache({
    cacheKey: competitionDetailCacheKey(competitionId, userId),
    source: 'api',
    fetchOnline: () => loadCompetitionById(competitionId),
  });
}

export async function registerForCompetition(
  userId: string,
  competitionId: string,
): Promise<CompetitionMutationResult> {
  const online = await fetchNetworkOnline();
  if (!online) {
    await validateRegistrationFromCache(userId, competitionId, true);
    const path = registerPath(competitionId);
    const alreadyQueued = await offlineStore.hasPendingMutation(path, {});
    if (alreadyQueued) throw new Error('Inscription déjà en attente de synchronisation.');
    await enqueueApiMutation({ method: 'POST', path, body: {} });
    await applyOptimisticRegistration(userId, competitionId, true);
    return { queued: true };
  }

  try {
    await apiClient.post(registerPath(competitionId), {}, { headers: authHeaders() });
    return { queued: false };
  } catch (error) {
    throwIfNestRouteMissing(error, `POST /api/v1/defis/competitions/${competitionId}/register`);
    if (isTournamentFull(error)) {
      throw new Error('Ce tournoi a atteint le nombre maximum de participants.');
    }
    throw new Error(extractApiError(error, "Impossible de s'inscrire à ce tournoi."));
  }
}

export async function unregisterFromCompetition(
  userId: string,
  competitionId: string,
): Promise<CompetitionMutationResult> {
  const online = await fetchNetworkOnline();
  if (!online) {
    await validateRegistrationFromCache(userId, competitionId, false);
    const path = unregisterPath(competitionId);
    const alreadyQueued = await offlineStore.hasPendingMutation(path, {});
    if (alreadyQueued) throw new Error('Désinscription déjà en attente de synchronisation.');
    await enqueueApiMutation({ method: 'POST', path, body: {} });
    await applyOptimisticRegistration(userId, competitionId, false);
    return { queued: true };
  }

  try {
    await apiClient.post(unregisterPath(competitionId), {}, { headers: authHeaders() });
    return { queued: false };
  } catch (error) {
    throwIfNestRouteMissing(error, `POST /api/v1/defis/competitions/${competitionId}/unregister`);
    throw new Error(extractApiError(error, 'Impossible de se désinscrire de ce tournoi.'));
  }
}
