import { useCallback, useEffect, useState } from 'react';

import type { AuthMeResponse } from '@services/auth/fetchAuthMe';
import { fetchAuthMe } from '@services/auth/fetchAuthMe';
import { useAuthStore } from '@stores/authStore';

interface UseAuthMeResult {
  data: AuthMeResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAuthMe(): UseAuthMeResult {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<AuthMeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!useAuthStore.getState().token?.trim()) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuthMe();
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [token, load]);

  return { data, loading, error, refetch: load };
}
