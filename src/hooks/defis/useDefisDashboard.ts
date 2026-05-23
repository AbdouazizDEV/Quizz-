import { useQuery } from '@tanstack/react-query';

import type { DefisDashboardData } from '@app-types/defisDashboard.types';
import { fetchDefisDashboard } from '@services/defis/defisDashboardRepository';

export function useDefisDashboard(userId: string | undefined) {
  return useQuery<DefisDashboardData>({
    queryKey: ['defis-dashboard', userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }
      return fetchDefisDashboard(userId);
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });
}
