import { fetchNetworkOnline } from './networkStatus';
import { offlineStore } from './OfflineStore';
import { updateOfflinePendingCount } from './offlineSyncEngine';
import type { OfflineMutationResult } from './types';

/** Exécute en ligne, ou met en file d'attente hors ligne. */
export async function runOnlineOrQueue<T>(
  online: () => Promise<T>,
  queueOffline: () => Promise<void>,
): Promise<OfflineMutationResult<T>> {
  if (await fetchNetworkOnline()) {
    const data = await online();
    return { queued: false, data };
  }

  await queueOffline();
  await updateOfflinePendingCount();
  return { queued: true };
}

export async function enqueueApiMutation(input: {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
}): Promise<void> {
  await offlineStore.enqueueMutation({
    source: 'api',
    method: input.method,
    url: input.path,
    body: input.body,
  });
}

export async function enqueueSupabaseMutation(input: {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: unknown;
}): Promise<void> {
  await offlineStore.enqueueMutation({
    source: 'supabase',
    method: input.method,
    url: input.url,
    body: input.body,
  });
}
