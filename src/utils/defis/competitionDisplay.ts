import type { CompetitionSummary } from '@app-types/challenge.types';

export const COMPETITION_STATUS_LABELS: Record<CompetitionSummary['status'], string> = {
  draft: 'Brouillon',
  scheduled: 'Inscriptions ouvertes',
  live: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

function parseTime(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

/** Statut affiché en tenant compte des dates (évite « En cours » + compte à rebours « Expiré »). */
export function resolveEffectiveCompetitionStatus(
  competition: Pick<CompetitionSummary, 'status' | 'startsAt' | 'endsAt'>,
): CompetitionSummary['status'] {
  if (competition.status === 'cancelled' || competition.status === 'draft') {
    return competition.status;
  }

  const now = Date.now();
  const ends = parseTime(competition.endsAt);
  const starts = parseTime(competition.startsAt);

  if (ends != null && now >= ends) return 'completed';
  if (competition.status === 'completed') return 'completed';
  if (starts != null && now >= starts) return 'live';
  if (competition.status === 'live' && ends != null && now < ends) return 'live';
  if (competition.status === 'scheduled') return 'scheduled';
  return competition.status;
}

export function getCompetitionStatusLabel(
  competition: Pick<CompetitionSummary, 'status' | 'startsAt' | 'endsAt'>,
): string {
  return COMPETITION_STATUS_LABELS[resolveEffectiveCompetitionStatus(competition)];
}

export function getCompetitionCountdown(
  competition: Pick<CompetitionSummary, 'status' | 'startsAt' | 'endsAt'>,
): { target: string; label: string } | null {
  const effective = resolveEffectiveCompetitionStatus(competition);
  const now = Date.now();

  if (effective === 'scheduled') {
    const starts = parseTime(competition.startsAt);
    if (starts == null || now >= starts || !competition.startsAt) return null;
    return { target: competition.startsAt, label: 'Début dans' };
  }

  if (effective === 'live') {
    const ends = parseTime(competition.endsAt);
    if (ends == null || now >= ends || !competition.endsAt) return null;
    return { target: competition.endsAt, label: 'Se termine dans' };
  }

  return null;
}

export function canRegisterForCompetition(
  competition: Pick<
    CompetitionSummary,
    'status' | 'startsAt' | 'endsAt' | 'isRegistered' | 'registeredCount' | 'maxParticipants'
  >,
): boolean {
  const effective = resolveEffectiveCompetitionStatus(competition);
  const isFull = competition.registeredCount >= competition.maxParticipants;
  return effective === 'scheduled' && !competition.isRegistered && !isFull;
}
