import { useCallback, useEffect, useState } from 'react';

import type { PlayerBadgeView } from '@constants/westAfricanBadges';
import { progressionApi } from '@services/progression/progressionRepository';
import { useAuthStore } from '@stores/authStore';

export function usePlayerBadges() {
  const token = useAuthStore((s) => s.token);
  const [badges, setBadges] = useState<PlayerBadgeView[]>([]);

  const refetch = useCallback(async () => {
    if (!token?.trim()) {
      setBadges([]);
      return;
    }
    try {
      const res = await progressionApi.badges();
      setBadges(res.badges ?? []);
    } catch {
      setBadges([]);
    }
  }, [token]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { badges, refetch };
}
