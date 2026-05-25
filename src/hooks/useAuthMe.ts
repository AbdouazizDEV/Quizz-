import { useCallback, useEffect } from 'react';

import type { AuthMeResponse } from '@sdk';
import { invalidateAuthMeCache, loadAuthMe } from '@services/auth/authMeRepository';
import { useAuthMeStore } from '@stores/authMeStore';
import { useAuthStore } from '@stores/authStore';

interface UseAuthMeResult {
  data: AuthMeResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: (options?: { force?: boolean }) => Promise<void>;
}

/**
 * Cache partagé (Zustand + SQLite) pour GET /auth/me.
 * Les appels réseau sont dédupliqués et ignorés tant que le cache n’est pas expiré.
 */
export function useAuthMe(): UseAuthMeResult {
  const token = useAuthStore((s) => s.token);
  const data = useAuthMeStore((s) => s.data);
  const loading = useAuthMeStore((s) => s.loading);
  const error = useAuthMeStore((s) => s.error);

  const refetch = useCallback(async (options?: { force?: boolean }) => {
    if (options?.force) {
      await invalidateAuthMeCache();
      return;
    }
    await loadAuthMe({ force: false });
  }, []);

  useEffect(() => {
    if (!token?.trim()) {
      useAuthMeStore.getState().clear();
      return;
    }
    void loadAuthMe({ force: false });
  }, [token]);

  return { data, loading, error, refetch };
}
