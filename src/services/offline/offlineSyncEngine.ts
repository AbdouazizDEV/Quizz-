import { apiClient } from '@services/api/apiClient';
import { loadAuthMe, patchAuthMeFromQuizComplete } from '@services/auth/authMeRepository';
import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';
import { ensureSupabaseAuthSession } from '@services/supabase/syncSupabaseAuthSession';
import { useAuthStore } from '@stores/authStore';
import { useNetworkStore } from '@stores/networkStore';
import { isAxiosError } from 'axios';

import { CHALLENGE_PARTICIPATION_INSERT, type ChallengeParticipationMutationBody } from './challengeMutations';
import {
  COMPETITION_REGISTER_MUTATION,
  COMPETITION_UNREGISTER_MUTATION,
  type CompetitionRegistrationMutationBody,
} from './competitionMutations';
import {
  isQuizCompleteApiPath,
  parseQuizSessionCompleteResponse,
} from './quizSessionMutations';
import { fetchNetworkOnline } from './networkStatus';
import { offlineStore } from './OfflineStore';
import type { QueuedMutation } from './types';

type SyncCompleteListener = () => void;

const syncCompleteListeners = new Set<SyncCompleteListener>();
let syncInProgress = false;

export function onOfflineSyncComplete(listener: SyncCompleteListener): () => void {
  syncCompleteListeners.add(listener);
  return () => syncCompleteListeners.delete(listener);
}

function notifySyncComplete(): void {
  for (const listener of syncCompleteListeners) {
    listener();
  }
}

async function refreshPendingCount(): Promise<void> {
  const count = await offlineStore.countPendingMutations();
  useNetworkStore.getState().setPendingSyncCount(count);
}

function isDuplicateRegistrationError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('duplicate') || lower.includes('unique') || lower.includes('23505');
}

function shouldStopSync(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes('session') ||
    message.includes('jwt') ||
    message.includes('non connecté') ||
    message.includes('reconnectez-vous')
  );
}

function isPermanentMutationFailure(error: unknown): boolean {
  const message = (error instanceof Error ? error.message : String(error ?? '')).toLowerCase();
  if (
    message.includes('foreign key') ||
    message.includes('constraint') ||
    message.includes('prisma') ||
    message.includes('quiz introuvable') ||
    message.includes('introuvable') ||
    message.includes('not found')
  ) {
    return true;
  }
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  if (status === 400 || status === 404 || status === 409 || status === 422) return true;
  const body = JSON.stringify(error.response?.data ?? '').toLowerCase();
  return (
    body.includes('foreign key') ||
    body.includes('constraint') ||
    body.includes('quiz introuvable') ||
    body.includes('quiz_sessions') ||
    body.includes('user_quiz_scores')
  );
}

function mutationLooksPermanentlyDead(mutation: QueuedMutation): boolean {
  const err = (mutation.lastError ?? '').toLowerCase();
  if (
    err.includes('foreign key') ||
    err.includes('constraint') ||
    err.includes('prisma') ||
    err.includes('user_quiz_scores') ||
    err.includes('quiz_sessions.create') ||
    err.includes('quiz introuvable') ||
    err.includes('introuvable') ||
    err.includes('not found')
  ) {
    return true;
  }
  if (isQuizCompleteApiPath(mutation.url) && mutation.attempts >= 2 && mutation.status === 'failed') {
    return true;
  }
  return false;
}

function authHeaders(): { Authorization: string } {
  const token = useAuthStore.getState().token?.trim();
  if (!token) throw new Error('Utilisateur non connecté.');
  return { Authorization: `Bearer ${token}` };
}

async function executeSupabaseMutation(mutation: QueuedMutation): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase non configuré');

  await ensureSupabaseAuthSession(useAuthStore.getState().token);

  const body = mutation.bodyJson ? JSON.parse(mutation.bodyJson) : null;

  if (mutation.url === COMPETITION_REGISTER_MUTATION) {
    const payload = body as CompetitionRegistrationMutationBody;
    const { error } = await supabase.from('competition_registrations').insert({
      user_id: payload.user_id,
      competition_id: payload.competition_id,
    });
    if (error && !isDuplicateRegistrationError(error.message)) {
      throw new Error(error.message);
    }
    return;
  }

  if (mutation.url === COMPETITION_UNREGISTER_MUTATION) {
    const payload = body as CompetitionRegistrationMutationBody;
    const { error } = await supabase
      .from('competition_registrations')
      .delete()
      .eq('user_id', payload.user_id)
      .eq('competition_id', payload.competition_id);
    if (error) throw new Error(error.message);
    return;
  }

  if (mutation.url === CHALLENGE_PARTICIPATION_INSERT) {
    const payload = body as ChallengeParticipationMutationBody;
    const { error } = await supabase.from('challenge_participations').insert({
      user_id: payload.user_id,
      challenge_id: payload.challenge_id,
      quiz_id: payload.quiz_id,
      score: payload.score,
      played_at: payload.played_at,
    });
    if (error && !isDuplicateRegistrationError(error.message)) {
      throw new Error(error.message);
    }
    return;
  }

  throw new Error(`Mutation Supabase non supportée: ${mutation.url}`);
}

async function applyQuizCompleteResponse(path: string, data: unknown): Promise<void> {
  if (!isQuizCompleteApiPath(path)) return;
  const payload = parseQuizSessionCompleteResponse(data);
  if (!payload) return;
  await patchAuthMeFromQuizComplete({
    total_score: payload.total_score,
    quizzes_completed: payload.quizzes_completed,
  });
  await loadAuthMe({ force: true });
}

async function executeApiMutation(mutation: QueuedMutation): Promise<void> {
  const headers = authHeaders();
  const body = mutation.bodyJson ? JSON.parse(mutation.bodyJson) : undefined;
  const path = mutation.url;

  if (mutation.method === 'POST') {
    try {
      const { data } = await apiClient.post(path, body ?? {}, { headers });
      await applyQuizCompleteResponse(path, data);
      return;
    } catch (error) {
      if (isQuizCompleteApiPath(path) && isPermanentMutationFailure(error)) {
        await loadAuthMe({ force: true });
        return;
      }
      throw error;
    }
  }
  if (mutation.method === 'PUT') {
    await apiClient.put(path, body ?? {}, { headers });
    return;
  }
  if (mutation.method === 'PATCH') {
    await apiClient.patch(path, body ?? {}, { headers });
    return;
  }
  if (mutation.method === 'DELETE') {
    await apiClient.delete(path, { headers, data: body });
    return;
  }

  throw new Error(`Méthode API non supportée: ${mutation.method}`);
}

async function executeMutation(mutation: QueuedMutation): Promise<void> {
  if (mutation.source === 'supabase') {
    await executeSupabaseMutation(mutation);
    return;
  }
  if (mutation.source === 'api') {
    await executeApiMutation(mutation);
    return;
  }
  throw new Error(`Source non supportée: ${mutation.source}`);
}

const LEGACY_QUIZ_SESSION_COMPLETE = 'supabase://quiz_sessions/complete';

async function purgeStaleOfflineMutations(): Promise<boolean> {
  const pending = await offlineStore.listPendingMutations();
  let purged = false;
  for (const mutation of pending) {
    const legacy =
      mutation.source === 'supabase' &&
      (mutation.url === LEGACY_QUIZ_SESSION_COMPLETE ||
        mutation.url === COMPETITION_REGISTER_MUTATION ||
        mutation.url === COMPETITION_UNREGISTER_MUTATION);
    if (legacy || mutationLooksPermanentlyDead(mutation)) {
      await offlineStore.markMutationDone(mutation.id);
      purged = true;
    }
  }
  if (purged) await offlineStore.purgeDoneMutations();
  return purged;
}

/** Rejoue la file offline FIFO (une mutation à la fois). */
export async function runOfflineSync(): Promise<void> {
  if (syncInProgress) return;
  if (!(await fetchNetworkOnline())) return;

  syncInProgress = true;
  let syncedAny = false;

  try {
    if (await purgeStaleOfflineMutations()) {
      await refreshPendingCount();
      syncedAny = true;
    }

    const pending = await offlineStore.listPendingMutations();
    if (!pending.length) {
      await refreshPendingCount();
      if (syncedAny) notifySyncComplete();
      return;
    }

    for (const mutation of pending) {
      await offlineStore.markMutationSyncing(mutation.id);
      try {
        await executeMutation(mutation);
        await offlineStore.markMutationDone(mutation.id);
        syncedAny = true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Synchronisation impossible.';
        if (isPermanentMutationFailure(error)) {
          await offlineStore.markMutationDone(mutation.id);
          if (isQuizCompleteApiPath(mutation.url)) {
            await loadAuthMe({ force: true });
          }
          syncedAny = true;
          continue;
        }
        await offlineStore.markMutationFailed(mutation.id, message);
        if (shouldStopSync(error)) break;
      }
    }

    await offlineStore.purgeDoneMutations();
    await refreshPendingCount();
    if (syncedAny) notifySyncComplete();
  } finally {
    syncInProgress = false;
  }
}

export async function updateOfflinePendingCount(): Promise<void> {
  await purgeStaleOfflineMutations();
  await refreshPendingCount();
}
