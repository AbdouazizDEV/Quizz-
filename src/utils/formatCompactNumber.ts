/** Formate un nombre pour l’affichage type réseau social (5.6M, 372.5K). */
export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${trimTrailingZero((value / 1_000_000_000).toFixed(1))}B`;
  }
  if (abs >= 1_000_000) {
    return `${trimTrailingZero((value / 1_000_000).toFixed(1))}M`;
  }
  if (abs >= 1_000) {
    return `${trimTrailingZero((value / 1_000).toFixed(1))}K`;
  }
  return String(Math.round(value));
}

function trimTrailingZero(s: string): string {
  return s.replace(/\.0([KMB])$/, '$1');
}
