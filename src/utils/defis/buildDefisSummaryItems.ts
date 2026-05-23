import type { DefisSummaryLine } from '@app-types/defisDashboard.types';

export function buildDefisSummaryItems(data: {
  activeChallengeCount: number;
  activeTournamentCount: number;
  pendingDuelCount: number;
}): DefisSummaryLine[] {
  const challengeLabel =
    data.activeChallengeCount === 0
      ? 'Aucun challenge actif'
      : data.activeChallengeCount === 1
        ? '1 challenge actif'
        : `${data.activeChallengeCount} challenges actifs`;

  const tournamentLabel =
    data.activeTournamentCount === 0
      ? 'Aucun tournoi en cours'
      : data.activeTournamentCount === 1
        ? '1 tournoi en cours'
        : `${data.activeTournamentCount} tournois en cours`;

  const duelLabel =
    data.pendingDuelCount === 0
      ? 'Aucun duel en attente'
      : data.pendingDuelCount === 1
        ? '1 duel disponible'
        : `${data.pendingDuelCount} duels disponibles`;

  return [
    { id: 'challenge', label: challengeLabel, icon: 'flag', count: data.activeChallengeCount },
    { id: 'tournament', label: tournamentLabel, icon: 'award', count: data.activeTournamentCount },
    { id: 'duel', label: duelLabel, icon: 'zap', count: data.pendingDuelCount },
  ];
}
