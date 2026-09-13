import { useQuery } from '@tanstack/react-query';

import { useDailyDateKey } from '@hooks/useDailyDateKey';
import { fetchHomeFunFacts } from '@services/data/home/funFactsRepository';
import { DAILY_CONTENT_TIMEZONE } from '@utils/dailyContentDate';

export function useHomeFunFacts(enabled = true, timezone = DAILY_CONTENT_TIMEZONE) {
  const dateKey = useDailyDateKey(timezone);

  return useQuery({
    queryKey: ['home', 'fun-facts', dateKey],
    queryFn: fetchHomeFunFacts,
    enabled,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
