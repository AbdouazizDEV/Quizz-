import type { CompetitionSummary } from '@app-types/challenge.types';

import { competitionDetailCacheKey, competitionsListCacheKey } from './competitionCacheKeys';
import { offlineStore } from './OfflineStore';

const INSCRIPTIONS_TAB = 'inscriptions' as const;
const ALL_TABS = ['inscriptions', 'en_cours', 'fin'] as const;

async function patchCompetitionInListCache(
  cacheKey: string,
  competitionId: string,
  patch: (item: CompetitionSummary) => CompetitionSummary,
): Promise<void> {
  const list = await offlineStore.getCachedResponse<CompetitionSummary[]>(cacheKey);
  if (!list?.length) return;

  const hasMatch = list.some((item) => item.id === competitionId);
  if (!hasMatch) return;

  const updated = list.map((item) => (item.id === competitionId ? patch(item) : item));
  await offlineStore.setCachedResponse({ cacheKey, source: 'supabase', data: updated });
}

export async function findCachedCompetitionSummary(
  userId: string,
  competitionId: string,
): Promise<CompetitionSummary | null> {
  const detail = await offlineStore.getCachedResponse<CompetitionSummary | null>(
    competitionDetailCacheKey(competitionId, userId),
  );
  if (detail) return detail;

  for (const tab of ALL_TABS) {
    const list = await offlineStore.getCachedResponse<CompetitionSummary[]>(
      competitionsListCacheKey(tab, userId),
    );
    const found = list?.find((item) => item.id === competitionId);
    if (found) return found;
  }

  return null;
}

export async function validateRegistrationFromCache(
  userId: string,
  competitionId: string,
  register: boolean,
): Promise<CompetitionSummary> {
  const competition = await findCachedCompetitionSummary(userId, competitionId);
  if (!competition) {
    throw new Error('Tournoi indisponible hors ligne. Consultez-le une fois en ligne.');
  }

  if (register) {
    if (competition.status !== 'scheduled') {
      throw new Error('Les inscriptions sont fermées pour ce tournoi.');
    }
    if (competition.isRegistered) {
      throw new Error('Vous êtes déjà inscrit à ce tournoi.');
    }
    if (competition.registeredCount >= competition.maxParticipants) {
      throw new Error('Ce tournoi a atteint le nombre maximum de participants.');
    }
  } else if (!competition.isRegistered) {
    throw new Error("Vous n'êtes pas inscrit à ce tournoi.");
  }

  return competition;
}

export async function applyOptimisticRegistration(
  userId: string,
  competitionId: string,
  register: boolean,
): Promise<void> {
  const delta = register ? 1 : -1;

  const patch = (item: CompetitionSummary): CompetitionSummary => ({
    ...item,
    isRegistered: register,
    registeredCount: Math.max(0, item.registeredCount + delta),
  });

  for (const tab of ALL_TABS) {
    await patchCompetitionInListCache(competitionsListCacheKey(tab, userId), competitionId, patch);
  }

  const detailKey = competitionDetailCacheKey(competitionId, userId);
  const detail = await offlineStore.getCachedResponse<CompetitionSummary | null>(detailKey);
  if (detail) {
    await offlineStore.setCachedResponse({
      cacheKey: detailKey,
      source: 'supabase',
      data: patch(detail),
    });
  } else if (register) {
    const inscriptionsList = await offlineStore.getCachedResponse<CompetitionSummary[]>(
      competitionsListCacheKey(INSCRIPTIONS_TAB, userId),
    );
    const fromList = inscriptionsList?.find((item) => item.id === competitionId);
    if (fromList) {
      await offlineStore.setCachedResponse({
        cacheKey: detailKey,
        source: 'supabase',
        data: patch(fromList),
      });
    }
  }
}
