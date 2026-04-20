import { useCallback, useEffect, useState } from 'react';

import { getSupabaseClient } from '@services/supabase/supabaseClientSingleton';

export interface HomeLeaderboardRow {
  id: string;
  displayName: string;
  points: number;
  avatar?: string;
}

interface Result {
  data: HomeLeaderboardRow[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useHomeLeaderboard(limit = 5): Result {
  const [data, setData] = useState<HomeLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getSupabaseClient();
      if (!client) {
        setData([]);
        return;
      }
      const { data: rows, error: qErr } = await client
        .from('profiles')
        .select('id, username, full_name, avatar_url, total_score')
        .order('total_score', { ascending: false })
        .limit(limit);
      if (qErr) throw qErr;
      const mapped =
        rows?.map((r) => ({
          id: r.id,
          displayName: r.full_name?.trim() || r.username?.trim() || 'Joueur',
          points: r.total_score ?? 0,
          avatar: r.avatar_url ?? undefined,
        })) ?? [];
      setData(mapped);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
