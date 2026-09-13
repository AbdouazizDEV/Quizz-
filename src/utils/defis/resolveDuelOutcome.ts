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

function resolvePlayedOutcome(
  duel: DuelSummary,
  userId: string,
  myScore: number,
  oppScore: number,
): DuelOutcome {
  if (duel.winnerId === userId || (duel.winnerId === null && myScore > oppScore)) {
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

/** Résultat affiché : Victoire / Défaite / Égalité quand les deux scores sont connus. */
export function resolveDuelOutcome(duel: DuelSummary, userId: string): DuelOutcome {
  const isChallenger = duel.challengerId === userId;
  const myScoreRaw = isChallenger ? duel.challengerScore : duel.challengedScore;
  const oppScoreRaw = isChallenger ? duel.challengedScore : duel.challengerScore;

  if (myScoreRaw !== null && oppScoreRaw !== null) {
    return resolvePlayedOutcome(duel, userId, myScoreRaw, oppScoreRaw);
  }

  if (duel.status === 'declined' || duel.status === 'expired' || duel.isExpired) {
    return {
      label: 'Annulé',
      points: '+0 pts',
      won: false,
      lost: false,
      tone: 'neutral',
      icon: '—',
    };
  }

  return {
    label: 'En cours',
    points: '—',
    won: false,
    lost: false,
    tone: 'neutral',
    icon: '⏳',
  };
}

export function buildDuelResultHeadline(tone: DuelOutcomeTone): string {
  switch (tone) {
    case 'victory':
      return '🎉 Victoire !';
    case 'defeat':
      return 'Défaite';
    case 'draw':
      return '⚖️ Égalité !';
    default:
      return 'Duel annulé';
  }
}

export function buildDuelResultStatusLabel(tone: DuelOutcomeTone): string {
  switch (tone) {
    case 'victory':
      return 'Victoire';
    case 'defeat':
      return 'Défaite';
    case 'draw':
      return 'Égalité';
    default:
      return 'Annulé';
  }
}

export function isDuelOutcomePlayable(tone: DuelOutcomeTone): boolean {
  return tone === 'victory' || tone === 'defeat' || tone === 'draw';
}
