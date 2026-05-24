import { useCallback, useEffect, useState } from 'react';

import type { ProfileScreenData } from '@app-types/profile.types';
import { onOfflineSyncComplete } from '@services/offline';
import { getProfileDataProvider } from '@services/profile/profileDataProviderInstance';

interface UseProfileScreenDataResult {
  data: ProfileScreenData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProfileScreenData(userId?: string, waitForAuth = false): UseProfileScreenDataResult {
  const [data, setData] = useState<ProfileScreenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (waitForAuth) return;
    setLoading(true);
    setError(null);
    try {
      const provider = getProfileDataProvider();
      const next = await provider.getProfileScreenData(userId);
      setData(next);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [userId, waitForAuth]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return onOfflineSyncComplete(() => {
      void load();
    });
  }, [load]);

  return { data, loading, error, refetch: load };
}
