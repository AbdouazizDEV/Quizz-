export type OfflineSource = 'api' | 'supabase';

export type MutationQueueStatus = 'pending' | 'syncing' | 'failed' | 'done';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface CachedResponse {
  cacheKey: string;
  source: OfflineSource;
  method: HttpMethod;
  responseJson: string;
  statusCode: number;
  cachedAt: number;
}

export interface QueuedMutation {
  id: string;
  source: OfflineSource;
  method: Exclude<HttpMethod, 'GET'>;
  url: string;
  headersJson: string | null;
  bodyJson: string | null;
  createdAt: number;
  status: MutationQueueStatus;
  attempts: number;
  lastError: string | null;
  sortOrder: number;
}

export interface EnqueueMutationInput {
  source: OfflineSource;
  method: Exclude<HttpMethod, 'GET'>;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface OfflineMutationResult<T = void> {
  queued: boolean;
  data?: T;
}
