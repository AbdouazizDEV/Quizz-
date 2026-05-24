import type { DuelSummary } from '@app-types/challenge.types';

export interface DuelOutcome {
  label: string;
  points: string;
  won: boolean;
  lost: boolean;
}

export function resolveDuelOutcome(duel: DuelSummary, userId: string): DuelOutcome {
  if (duel.status === 'expired' || duel.isExpired) {
    const isChallenger = duel.challengerId === userId;
    const myScore = isChallenger ? duel.challengerScore : duel.challengedScore;
    return {
      label: myScore === null ? 'Expiré · Non joué' : 'Expiré',
      points: '+0 pts',
      won: false,
      lost: true,
    };
  }

  if (duel.status === 'declined') {
    const refusedByMe = duel.challengedId === userId;
    return {
      label: refusedByMe ? 'Refusé' : 'Décliné',
      points: '+0 pts',
      won: false,
      lost: !refusedByMe,
    };
  }

  const isChallenger = duel.challengerId === userId;
  const myScore = isChallenger ? duel.challengerScore ?? 0 : duel.challengedScore ?? 0;
  const oppScore = isChallenger ? duel.challengedScore ?? 0 : duel.challengerScore ?? 0;

  if (duel.winnerId === userId) {
    return { label: 'Victoire', points: '+15 pts', won: true, lost: false };
  }
  if (duel.winnerId && duel.winnerId !== userId) {
    return { label: 'Défaite', points: '+5 pts', won: false, lost: true };
  }
  if (myScore > oppScore) {
    return { label: 'Victoire', points: '+15 pts', won: true, lost: false };
  }
  if (myScore < oppScore) {
    return { label: 'Défaite', points: '+5 pts', won: false, lost: true };
  }
  return { label: 'Égalité', points: '+5 pts', won: false, lost: false };
}
