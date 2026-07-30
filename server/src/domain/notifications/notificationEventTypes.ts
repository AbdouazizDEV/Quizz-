/**
 * Types d’événements de notification (architecture générique / event-driven).
 * Extensible sans casser les consommateurs (OCP).
 */
export const NOTIFICATION_EVENT_TYPES = [
  'streak_reminder',
  'new_challenge',
  'ranking_change',
  'tournament_result',
  'duel_received',
  'duel_response',
  'reward_unlocked',
  'level_up',
  'partner_offer',
  'challenge_ending_soon',
  'friend_request',
  'admin_notice',
] as const;

export type NotificationEventType = (typeof NOTIFICATION_EVENT_TYPES)[number];

export function isNotificationEventType(value: string): value is NotificationEventType {
  return (NOTIFICATION_EVENT_TYPES as readonly string[]).includes(value);
}
