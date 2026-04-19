import { useCallback, useEffect, useState } from 'react';

import type { CategoryExploreItem } from '@app-types/categoryExplore.types';
import { fetchCategoriesWithQuizCounts } from '@services/data/categories/categoryExploreRepository';

interface Result {
  data: CategoryExploreItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCategoriesExplore(): Result {
  const [data, setData] = useState<CategoryExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchCategoriesWithQuizCounts());
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
