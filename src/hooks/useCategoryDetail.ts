import { useCallback, useEffect, useState } from 'react';

import type { CategoryDetailBundle, QuizSortMode } from '@app-types/categoryExplore.types';
import { fetchCategoryDetailBySlug } from '@services/data/categories/categoryExploreRepository';

interface Result {
  data: CategoryDetailBundle | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCategoryDetail(slug: string | undefined, sort: QuizSortMode): Result {
  const [data, setData] = useState<CategoryDetailBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!slug?.trim()) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const bundle = await fetchCategoryDetailBySlug(slug.trim(), sort);
      setData(bundle);
      if (!bundle) {
        setError(new Error('Catégorie introuvable.'));
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [slug, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
