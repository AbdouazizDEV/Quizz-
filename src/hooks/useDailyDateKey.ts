import { useEffect, useState } from 'react';

import {
  DAILY_CONTENT_TIMEZONE,
  getDailyDateKey,
  getMsUntilNextMidnight,
} from '@utils/dailyContentDate';

/**
 * Clé de jour qui se met à jour automatiquement à 00h00 (fuseau utilisateur ou Dakar).
 * Permet d'invalider les contenus quotidiens (fun facts, quiz du jour).
 */
export function useDailyDateKey(timezone = DAILY_CONTENT_TIMEZONE): string {
  const [dateKey, setDateKey] = useState(() => getDailyDateKey(new Date(), timezone));

  useEffect(() => {
    const sync = () => {
      const next = getDailyDateKey(new Date(), timezone);
      setDateKey((prev) => (prev === next ? prev : next));
    };

    let midnightTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleMidnight = () => {
      midnightTimer = setTimeout(() => {
        sync();
        scheduleMidnight();
      }, getMsUntilNextMidnight(timezone));
    };

    scheduleMidnight();
    const poll = setInterval(sync, 60_000);

    return () => {
      if (midnightTimer) clearTimeout(midnightTimer);
      clearInterval(poll);
    };
  }, [timezone]);

  return dateKey;
}
