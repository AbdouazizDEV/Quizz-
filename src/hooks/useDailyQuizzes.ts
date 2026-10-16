import { useQuery } from '@tanstack/react-query';

import { useDailyDateKey } from '@hooks/useDailyDateKey';
import { fetchDailyQuizzes } from '@services/data/home/dailyQuizRepository';
import { DAILY_CONTENT_TIMEZONE } from '@utils/dailyContentDate';

export function useDailyQuizzes(enabled = true, timezone = DAILY_CONTENT_TIMEZONE) {
  const dateKey = useDailyDateKey(timezone);

  return useQuery({
    queryKey: ['home', 'daily-quizzes', dateKey],
    queryFn: fetchDailyQuizzes,
    enabled,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
