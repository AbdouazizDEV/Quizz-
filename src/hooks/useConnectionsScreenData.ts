import { useCallback, useEffect, useState } from 'react';

import type { ConnectionsScreenData } from '@app-types/network.types';
import { getConnectionsDataProvider } from '@services/network/connectionsDataProviderInstance';

interface Result {
  data: ConnectionsScreenData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useConnectionsScreenData(userId?: string): Result {
  const [data, setData] = useState<ConnectionsScreenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = getConnectionsDataProvider();
      setData(await provider.getConnections(userId));
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
