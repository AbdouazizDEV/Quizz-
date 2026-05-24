import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'quizz_offline.db';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS api_cache (
  cache_key TEXT PRIMARY KEY NOT NULL,
  source TEXT NOT NULL,
  method TEXT NOT NULL,
  response_json TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 200,
  cached_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS mutation_queue (
  id TEXT PRIMARY KEY NOT NULL,
  source TEXT NOT NULL,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  headers_json TEXT,
  body_json TEXT,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sort_order INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mutation_queue_pending
  ON mutation_queue(status, sort_order);
`;

let dbInstance: SQLite.SQLiteDatabase | null = null;
let useMemoryFallback = Platform.OS === 'web';

/** Cache mémoire de secours (web / dev) si SQLite indisponible. */
export const memoryCache = new Map<string, string>();
export const memoryQueue: Array<Record<string, unknown>> = [];

export async function getOfflineDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (useMemoryFallback) return null;
  if (dbInstance) return dbInstance;

  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(SCHEMA);
    dbInstance = db;
    return db;
  } catch (error) {
    useMemoryFallback = true;
    if (__DEV__) {
      console.warn('[Offline] SQLite indisponible, fallback mémoire.', error);
    }
    return null;
  }
}

export function isUsingMemoryFallback(): boolean {
  return useMemoryFallback;
}
