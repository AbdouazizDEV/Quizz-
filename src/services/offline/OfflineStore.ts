import type {
  CachedResponse,
  EnqueueMutationInput,
  HttpMethod,
  OfflineSource,
  QueuedMutation,
} from './types';
import {
  enableMemoryFallback,
  getOfflineDatabase,
  isUsingMemoryFallback,
  memoryCache,
  memoryQueue,
} from './offlineDatabase';

function createMutationId(): string {
  return `mq_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isSqliteError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('NativeDatabase') ||
    message.includes('prepareAsync') ||
    message.includes('NullPointerException')
  );
}

function handleSqliteFailure(error: unknown): void {
  if (isSqliteError(error)) {
    enableMemoryFallback(error);
    return;
  }
  if (__DEV__) {
    console.warn('[Offline] Erreur SQLite.', error);
  }
}

function mapQueuedRow(row: Record<string, unknown>): QueuedMutation {
  return {
    id: String(row.id),
    source: row.source as OfflineSource,
    method: row.method as QueuedMutation['method'],
    url: String(row.url),
    headersJson: row.headers_json != null ? String(row.headers_json) : null,
    bodyJson: row.body_json != null ? String(row.body_json) : null,
    createdAt: Number(row.created_at),
    status: row.status as QueuedMutation['status'],
    attempts: Number(row.attempts),
    lastError: row.last_error != null ? String(row.last_error) : null,
    sortOrder: Number(row.sort_order),
  };
}

export class OfflineStore {
  async init(): Promise<void> {
    await getOfflineDatabase();
  }

  async getCachedResponse<T>(cacheKey: string): Promise<T | null> {
    if (isUsingMemoryFallback()) {
      const raw = memoryCache.get(cacheKey);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    }

    try {
      const db = await getOfflineDatabase();
      if (!db) return null;

      const row = await db.getFirstAsync<{ response_json: string }>(
        'SELECT response_json FROM api_cache WHERE cache_key = ?',
        [cacheKey],
      );
      if (!row?.response_json) return null;

      return JSON.parse(row.response_json) as T;
    } catch (error) {
      handleSqliteFailure(error);
      const raw = memoryCache.get(cacheKey);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    }
  }

  async getCachedEntry(cacheKey: string): Promise<CachedResponse | null> {
    if (isUsingMemoryFallback()) {
      const raw = memoryCache.get(cacheKey);
      if (!raw) return null;
      return {
        cacheKey,
        source: 'api',
        method: 'GET',
        responseJson: raw,
        statusCode: 200,
        cachedAt: Date.now(),
      };
    }

    const db = await getOfflineDatabase();
    if (!db) return null;

    const row = await db.getFirstAsync<{
      cache_key: string;
      source: string;
      method: string;
      response_json: string;
      status_code: number;
      cached_at: number;
    }>(
      `SELECT cache_key, source, method, response_json, status_code, cached_at
       FROM api_cache WHERE cache_key = ?`,
      [cacheKey],
    );
    if (!row) return null;

    return {
      cacheKey: row.cache_key,
      source: row.source as OfflineSource,
      method: row.method as HttpMethod,
      responseJson: row.response_json,
      statusCode: row.status_code,
      cachedAt: row.cached_at,
    };
  }

  async setCachedResponse(input: {
    cacheKey: string;
    source: OfflineSource;
    method?: HttpMethod;
    data: unknown;
    statusCode?: number;
  }): Promise<void> {
    const responseJson = JSON.stringify(input.data);
    const cachedAt = Date.now();
    const method = input.method ?? 'GET';
    const statusCode = input.statusCode ?? 200;

    if (isUsingMemoryFallback()) {
      memoryCache.set(input.cacheKey, responseJson);
      return;
    }

    try {
      const db = await getOfflineDatabase();
      if (!db) return;

      await db.runAsync(
        `INSERT INTO api_cache (cache_key, source, method, response_json, status_code, cached_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(cache_key) DO UPDATE SET
           source = excluded.source,
           method = excluded.method,
           response_json = excluded.response_json,
           status_code = excluded.status_code,
           cached_at = excluded.cached_at`,
        [input.cacheKey, input.source, method, responseJson, statusCode, cachedAt],
      );
    } catch (error) {
      handleSqliteFailure(error);
      memoryCache.set(input.cacheKey, responseJson);
    }
  }

  async enqueueMutation(input: EnqueueMutationInput): Promise<QueuedMutation> {
    const id = createMutationId();
    const createdAt = Date.now();
    const headersJson = input.headers ? JSON.stringify(input.headers) : null;
    const bodyJson = input.body !== undefined ? JSON.stringify(input.body) : null;

    if (isUsingMemoryFallback()) {
      const sortOrder = memoryQueue.length;
      const item = {
        id,
        source: input.source,
        method: input.method,
        url: input.url,
        headers_json: headersJson,
        body_json: bodyJson,
        created_at: createdAt,
        status: 'pending',
        attempts: 0,
        last_error: null,
        sort_order: sortOrder,
      };
      memoryQueue.push(item);
      return mapQueuedRow(item);
    }

    try {
      const db = await getOfflineDatabase();
      if (!db) throw new Error('Base offline indisponible');

      const sortRow = await db.getFirstAsync<{ next_order: number }>(
        `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM mutation_queue`,
      );
      const sortOrder = sortRow?.next_order ?? 0;

      await db.runAsync(
        `INSERT INTO mutation_queue
         (id, source, method, url, headers_json, body_json, created_at, status, attempts, last_error, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, NULL, ?)`,
        [id, input.source, input.method, input.url, headersJson, bodyJson, createdAt, sortOrder],
      );

      return {
        id,
        source: input.source,
        method: input.method,
        url: input.url,
        headersJson,
        bodyJson,
        createdAt,
        status: 'pending',
        attempts: 0,
        lastError: null,
        sortOrder,
      };
    } catch (error) {
      handleSqliteFailure(error);
      const sortOrder = memoryQueue.length;
      const item = {
        id,
        source: input.source,
        method: input.method,
        url: input.url,
        headers_json: headersJson,
        body_json: bodyJson,
        created_at: createdAt,
        status: 'pending',
        attempts: 0,
        last_error: null,
        sort_order: sortOrder,
      };
      memoryQueue.push(item);
      return mapQueuedRow(item);
    }
  }

  async listPendingMutations(): Promise<QueuedMutation[]> {
    if (isUsingMemoryFallback()) {
      return memoryQueue
        .filter((row) => row.status === 'pending' || row.status === 'failed')
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
        .map(mapQueuedRow);
    }

    try {
      const db = await getOfflineDatabase();
      if (!db) return [];

      const rows = await db.getAllAsync<Record<string, unknown>>(
        `SELECT * FROM mutation_queue
         WHERE status IN ('pending', 'failed')
         ORDER BY sort_order ASC, created_at ASC`,
      );
      return rows.map(mapQueuedRow);
    } catch (error) {
      handleSqliteFailure(error);
      return memoryQueue
        .filter((row) => row.status === 'pending' || row.status === 'failed')
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
        .map(mapQueuedRow);
    }
  }

  async markMutationSyncing(id: string): Promise<void> {
    await this.updateMutationStatus(id, 'syncing');
  }

  async markMutationDone(id: string): Promise<void> {
    await this.updateMutationStatus(id, 'done');
  }

  async markMutationFailed(id: string, errorMessage: string): Promise<void> {
    if (isUsingMemoryFallback()) {
      const item = memoryQueue.find((row) => row.id === id);
      if (item) {
        item.status = 'failed';
        item.attempts = Number(item.attempts ?? 0) + 1;
        item.last_error = errorMessage;
      }
      return;
    }

    const db = await getOfflineDatabase();
    if (!db) return;

    await db.runAsync(
      `UPDATE mutation_queue
       SET status = 'failed', attempts = attempts + 1, last_error = ?
       WHERE id = ?`,
      [errorMessage, id],
    );
  }

  async countPendingMutations(): Promise<number> {
    const pending = await this.listPendingMutations();
    return pending.length;
  }

  async purgeDoneMutations(): Promise<void> {
    if (isUsingMemoryFallback()) {
      for (let i = memoryQueue.length - 1; i >= 0; i -= 1) {
        if (memoryQueue[i]?.status === 'done') memoryQueue.splice(i, 1);
      }
      return;
    }

    const db = await getOfflineDatabase();
    if (!db) return;

    await db.runAsync(`DELETE FROM mutation_queue WHERE status = 'done'`);
  }

  async hasPendingMutation(url: string, body: Record<string, string>): Promise<boolean> {
    const pending = await this.listPendingMutations();
    return pending.some((mutation) => {
      if (mutation.url !== url) return false;
      if (!mutation.bodyJson) return false;
      try {
        const parsed = JSON.parse(mutation.bodyJson) as Record<string, string>;
        return Object.entries(body).every(([key, value]) => parsed[key] === value);
      } catch {
        return false;
      }
    });
  }

  private async updateMutationStatus(id: string, status: QueuedMutation['status']): Promise<void> {
    if (isUsingMemoryFallback()) {
      const item = memoryQueue.find((row) => row.id === id);
      if (item) item.status = status;
      return;
    }

    const db = await getOfflineDatabase();
    if (!db) return;

    await db.runAsync('UPDATE mutation_queue SET status = ? WHERE id = ?', [status, id]);
  }
}

export const offlineStore = new OfflineStore();
