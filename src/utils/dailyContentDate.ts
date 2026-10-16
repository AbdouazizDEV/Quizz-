const DEFAULT_TIMEZONE = 'Africa/Dakar';

/** Clé de jour locale (YYYY-MM-DD) pour le reset à 00h00. */
export function getDailyDateKey(at = new Date(), timezone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at);
}

/** Millisecondes jusqu'au prochain changement de jour dans le fuseau donné. */
export function getMsUntilNextMidnight(timezone = DEFAULT_TIMEZONE, at = new Date()): number {
  const dateKey = getDailyDateKey(at, timezone);
  let probe = at.getTime() + 60_000;
  const limit = at.getTime() + 86_400_000 + 3_600_000;

  while (probe < limit) {
    if (getDailyDateKey(new Date(probe), timezone) !== dateKey) {
      return Math.max(probe - at.getTime(), 1_000);
    }
    probe += 60_000;
  }

  return 86_400_000;
}

export { DEFAULT_TIMEZONE as DAILY_CONTENT_TIMEZONE };
