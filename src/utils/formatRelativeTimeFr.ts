/** Libellé type « il y a 2 semaines » pour une date ISO. */
export function formatRelativeTimeFr(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return 'récemment';
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return min <= 1 ? 'il y a 1 minute' : `il y a ${min} minutes`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return hours === 1 ? 'il y a 1 heure' : `il y a ${hours} heures`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days} jours`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks === 1 ? 'il y a 1 semaine' : `il y a ${weeks} semaines`;
  const months = Math.floor(days / 30);
  if (months < 12) return months <= 1 ? 'il y a 1 mois' : `il y a ${months} mois`;
  const years = Math.floor(days / 365);
  return years <= 1 ? 'il y a 1 an' : `il y a ${years} ans`;
}
