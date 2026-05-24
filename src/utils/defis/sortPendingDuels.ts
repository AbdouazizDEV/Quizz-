import type { DuelPhase, DuelSummary } from '@app-types/challenge.types';

const PHASE_PRIORITY: Record<DuelPhase, number> = {
  needs_your_acceptance: 0,
  your_turn: 1,
  waiting_opponent_acceptance: 2,
  waiting_opponent_play: 3,
  expired: 4,
  finished: 5,
};

/** Duels urgents (acceptation / à jouer) en premier, puis par échéance la plus proche. */
export function sortPendingDuels(duels: DuelSummary[]): DuelSummary[] {
  return [...duels].sort((a, b) => {
    const phaseDiff = (PHASE_PRIORITY[a.phase] ?? 99) - (PHASE_PRIORITY[b.phase] ?? 99);
    if (phaseDiff !== 0) return phaseDiff;
    return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
  });
}
