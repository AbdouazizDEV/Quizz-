import { useCallback, useEffect, useState } from 'react';

import type { GlobalLeaderboardPayload } from '@app-types/leaderboard.types';
import { fetchGlobalLeaderboard } from '@services/leaderboard/fetchGlobalLeaderboard';
import { useAuthStore } from '@stores/authStore';

interface Result extends GlobalLeaderboardPayload {
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const EMPTY: GlobalLeaderboardPayload = { items: [], me: null };

export function useGlobalLeaderboard(limit = 50): Result {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<GlobalLeaderboardPayload>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchGlobalLeaderboard(limit, token);
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setData(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [limit, token]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...data, loading, error, refetch: load };
}

