import type { DuelSummary } from '@app-types/challenge.types';

export type DuelOutcomeTone = 'victory' | 'defeat' | 'draw' | 'neutral' | 'expired';

export interface DuelOutcome {
  label: string;
  points: string;
  won: boolean;
  lost: boolean;
  tone: DuelOutcomeTone;
  icon: string;
}

export function resolveDuelOutcome(duel: DuelSummary, userId: string): DuelOutcome {
  if (duel.status === 'expired' || duel.isExpired) {
    const isChallenger = duel.challengerId === userId;
    const myScore = isChallenger ? duel.challengerScore : duel.challengedScore;
    return {
      label: myScore === null ? 'Non joué' : 'Expiré',
      points: '+0 pts',
      won: false,
      lost: true,
      tone: 'expired',
      icon: '⏱',
    };
  }

  if (duel.status === 'declined') {
    const refusedByMe = duel.challengedId === userId;
    return {
      label: refusedByMe ? 'Refusé' : 'Décliné',
      points: '+0 pts',
      won: false,
      lost: !refusedByMe,
      tone: 'neutral',
      icon: '✕',
    };
  }

  const isChallenger = duel.challengerId === userId;
  const myScore = isChallenger ? duel.challengerScore ?? 0 : duel.challengedScore ?? 0;
  const oppScore = isChallenger ? duel.challengedScore ?? 0 : duel.challengerScore ?? 0;

  if (duel.winnerId === userId) {
    return {
      label: 'Victoire',
      points: '+5 pts bonus',
      won: true,
      lost: false,
      tone: 'victory',
      icon: '🏆',
    };
  }
  if (duel.winnerId && duel.winnerId !== userId) {
    return {
      label: 'Défaite',
      points: 'Score quiz compté',
      won: false,
      lost: true,
      tone: 'defeat',
      icon: '💔',
    };
  }
  if (myScore > oppScore) {
    return {
      label: 'Victoire',
      points: '+5 pts bonus',
      won: true,
      lost: false,
      tone: 'victory',
      icon: '🏆',
    };
  }
  if (myScore < oppScore) {
    return {
      label: 'Défaite',
      points: 'Score quiz compté',
      won: false,
      lost: true,
      tone: 'defeat',
      icon: '💔',
    };
  }
  return {
    label: 'Égalité',
    points: 'Score quiz compté',
    won: false,
    lost: false,
    tone: 'draw',
    icon: '⚖️',
  };
}
