import { useCallback, useEffect, useState } from 'react';

import type { StatisticsScreenData } from '@app-types/statistics.types';
import { getStatisticsDataProvider } from '@services/statistics/statisticsDataProviderInstance';

interface Result {
  data: StatisticsScreenData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useStatisticsScreenData(userId?: string): Result {
  const [data, setData] = useState<StatisticsScreenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = getStatisticsDataProvider();
      setData(await provider.getStatistics(userId));
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
