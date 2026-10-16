import type { ArenaCampus, ArenaEdition, ArenaPeriod } from '@app-types/arena.types';

const DAKAR = 'Africa/Dakar';

export function formatArenaDate(isoDate: string, editionTimezone = DAKAR): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: editionTimezone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(utc);
}

export function formatArenaDateTime(iso: string, editionTimezone = DAKAR): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: editionTimezone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function sortArenaCampuses(campuses: ArenaCampus[]): ArenaCampus[] {
  return [...campuses].sort((a, b) => a.prospect_order - b.prospect_order);
}

export function arenaCampusDisplayName(campus: Pick<ArenaCampus, 'name' | 'role'>): string {
  if (campus.role === 'backup') {
    return `${campus.name} (secours)`;
  }
  return campus.name;
}

export function arenaDocumentStatusMessage(documentStatus: string | undefined): string | null {
  if (documentStatus === 'pending') {
    return 'Justificatif encore requis avant la qualification. L’inscription est déjà enregistrée.';
  }
  return null;
}

export function buildArenaScheduleSummary(edition: ArenaEdition): string[] {
  const hours = edition.schedule.daily_open_hours.join(', ');
  return [
    `Ouvertures quotidiennes (${edition.timezone}) : ${hours}`,
    `Fermeture du lundi au jeudi : ${edition.schedule.weekday_closes_at}`,
    `Vendredi : classement provisoire le matin, recours jusqu’à ${edition.schedule.friday_appeal_until}`,
  ];
}

export function formatArenaPeriodLine(period: ArenaPeriod, timezone: string): string {
  const start = formatArenaDate(period.starts_on, timezone);
  const end = formatArenaDate(period.ends_on, timezone);
  const sameDay = period.starts_on === period.ends_on;
  const range = sameDay ? start : `${start} → ${end}`;
  const campusSuffix =
    period.campus != null ? ` · ${arenaCampusDisplayName({ name: period.campus.name, role: 'priority' })}` : '';
  return `${period.label} : ${range}${campusSuffix}`;
}

export function isLikelyArenaRegistered(premium?: {
  source?: string | null;
  edition_key?: string | null;
} | null): boolean {
  if (!premium) return false;
  if (premium.source === 'arena') return true;
  return premium.edition_key === 'arena-2026';
}
