import { useCallback, useEffect, useRef, useState } from 'react';

import type { ConnectionFilter, ConnectionsScreenData } from '@app-types/network.types';
import { getConnectionsDataProvider } from '@services/network/connectionsDataProviderInstance';

interface Result {
  data: ConnectionsScreenData | null;
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

const PAGE_SIZE = 20;

export function useConnectionsScreenData(filter: ConnectionFilter, query: string): Result {
  const [data, setData] = useState<ConnectionsScreenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestRef = useRef(0);
  const dataRef = useRef<ConnectionsScreenData | null>(null);
  const loadingRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 320);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(
    async (mode: 'reset' | 'append') => {
      if (mode === 'append') {
        if (!dataRef.current?.hasMore || loadingRef.current || loadingMoreRef.current) return;
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      try {
        const provider = getConnectionsDataProvider();
        const page = mode === 'append' ? (dataRef.current?.page ?? 1) + 1 : 1;
        const pageData = await provider.getConnections({
          filter,
          query: debouncedQuery,
          page,
          limit: PAGE_SIZE,
        });
        // Ignore stale response when user changes filter/search rapidly.
        if (requestRef.current !== requestId) return;

        const currentData = dataRef.current;
        if (mode === 'append' && currentData) {
          setData({
            ...pageData,
            items: [...currentData.items, ...pageData.items],
          });
        } else {
          setData(pageData);
        }
      } catch (e) {
        if (requestRef.current === requestId) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (requestRef.current === requestId) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [debouncedQuery, filter],
  );

  useEffect(() => {
    void load('reset');
  }, [load]);

  const refetch = useCallback(async () => {
    await load('reset');
  }, [load]);

  const loadMore = useCallback(async () => {
    await load('append');
  }, [load]);

  return { data, loading, loadingMore, error, refetch, loadMore };
}
