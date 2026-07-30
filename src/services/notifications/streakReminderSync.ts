import {
  buildStreakReminderCopy,
  decideStreakReminderPhases,
  hoursUntilDeadline,
  type StreakReminderPhase,
} from '@domain/notifications/streakReminderPolicy';
import { apiClient } from '@services/api/apiClient';
import { useAuthStore } from '@stores/authStore';

function localDayKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Planifie les rappels de série selon la politique domaine :
 * - `afternoon` ~ STREAK_REMINDER_HOUR (18h)
 * - `final` ~ deadline - 1h (STREAK_DEADLINE_HOUR)
 * Déduplication côté API (une notif / phase / jour).
 */
export async function syncStreakReminders(streakDays = 0): Promise<void> {
  const token = useAuthStore.getState().token?.trim();
  if (!token) return;

  const phases = decideStreakReminderPhases();
  if (!phases.length) return;

  const dayKey = localDayKey();
  const hoursRemaining = hoursUntilDeadline();

  for (const phase of phases) {
    try {
      await apiClient.post(
        '/notifications/streak-reminder',
        {
          phase,
          streak_days: streakDays,
          local_day_key: dayKey,
          hours_remaining: hoursRemaining,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      /* silencieux : non bloquant pour l’UX */
    }
  }
}

/** Exposé pour tests / debug. */
export function previewStreakCopy(phase: StreakReminderPhase, streakDays: number) {
  return buildStreakReminderCopy(phase, streakDays, hoursUntilDeadline());
}
