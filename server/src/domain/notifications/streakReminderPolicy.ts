/**
 * Politique de rappels de série (heure locale utilisateur).
 * Valeurs paramétrables — à confirmer produit (Mamadou).
 */
export const STREAK_REMINDER_HOUR = 18;
/** Heure locale de fin de période active (0 = minuit). */
export const STREAK_DEADLINE_HOUR = 0;
/** Heures avant la deadline pour le rappel final (n°2). */
export const STREAK_FINAL_REMINDER_HOURS_BEFORE = 1;

export type StreakReminderPhase = 'afternoon' | 'final';

export interface StreakReminderDecision {
  phase: StreakReminderPhase;
  hoursRemainingApprox: number;
}

function localMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

function deadlineMinutes(): number {
  const h = ((STREAK_DEADLINE_HOUR % 24) + 24) % 24;
  return h === 0 ? 24 * 60 : h * 60;
}

/**
 * Décide quels rappels envoyer à cet instant local.
 * - afternoon : autour de STREAK_REMINDER_HOUR (fenêtre 60 min)
 * - final : autour de (deadline - STREAK_FINAL_REMINDER_HOURS_BEFORE)
 */
export function decideStreakReminderPhases(now = new Date()): StreakReminderPhase[] {
  const mins = localMinutes(now);
  const phases: StreakReminderPhase[] = [];

  const afternoonStart = STREAK_REMINDER_HOUR * 60;
  if (mins >= afternoonStart && mins < afternoonStart + 60) {
    phases.push('afternoon');
  }

  const finalAt = deadlineMinutes() - STREAK_FINAL_REMINDER_HOURS_BEFORE * 60;
  const finalStart = finalAt < 0 ? finalAt + 24 * 60 : finalAt;
  // Fenêtre d’1h autour du rappel final
  if (mins >= finalStart && mins < finalStart + 60) {
    phases.push('final');
  }

  return phases;
}

export function hoursUntilDeadline(now = new Date()): number {
  const mins = localMinutes(now);
  const deadline = deadlineMinutes();
  const remaining = deadline - mins;
  const safe = remaining <= 0 ? remaining + 24 * 60 : remaining;
  return Math.max(1, Math.ceil(safe / 60));
}

export function buildStreakReminderCopy(
  phase: StreakReminderPhase,
  streakCount: number,
  hoursRemaining: number,
): { title: string; body: string } {
  if (phase === 'afternoon') {
    return {
      title: 'Ta série t’attend 🔥',
      body: `Ta série de ${streakCount} jour${streakCount > 1 ? 's' : ''} t'attend 🔥 Joue un quiz avant minuit pour la conserver !`,
    };
  }
  return {
    title: 'Dernière chance !',
    body: `Dernière chance ! Il te reste ${hoursRemaining}h pour ne pas perdre ta série de ${streakCount} jour${streakCount > 1 ? 's' : ''}.`,
  };
}
