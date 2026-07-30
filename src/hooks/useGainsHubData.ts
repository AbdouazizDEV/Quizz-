import { useCallback, useEffect, useState } from 'react';

import type { GainsHubData } from '@app-types/gains.types';
import { useAuthMe } from '@hooks/useAuthMe';
import { fetchGlobalLeaderboard } from '@services/leaderboard/fetchGlobalLeaderboard';
import { mapToGainsHubData } from '@services/gains/mapToGainsHubData';
import { useAuthStore } from '@stores/authStore';

interface Result {
  data: GainsHubData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useGainsHubData(): Result {
  const token = useAuthStore((s) => s.token);
  const { data: me } = useAuthMe();
  const [data, setData] = useState<GainsHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const board = await fetchGlobalLeaderboard(10, token);
      const myRank =
        board.me?.rank ??
        board.items.find((i) => i.id === me?.user?.id)?.rank ??
        null;
      setData(
        mapToGainsHubData({
          me,
          leaderboard: board.items,
          myRank,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setData(
        mapToGainsHubData({
          me,
          leaderboard: [],
          myRank: null,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [me, token]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
