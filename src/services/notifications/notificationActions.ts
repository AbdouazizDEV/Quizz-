import type { AppNotification } from '@app-types/notification.types';
import { DefisRoutes } from '@constants/defisRoutes';

export type NotificationPressAction =
  | { kind: 'message' }
  | { kind: 'navigate'; href: string }
  | { kind: 'none' };

function readId(data: Record<string, unknown>, key: string): string | null {
  const value = data[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function getNotificationPressAction(item: AppNotification): NotificationPressAction {
  if (item.type === 'friend_request' && !item.isRead) {
    return { kind: 'none' };
  }

  const duelId = readId(item.data, 'duel_id');
  if (duelId) {
    const href =
      item.type === 'duel_completed'
        ? DefisRoutes.duelResult(duelId)
        : DefisRoutes.duelDetail(duelId);
    return { kind: 'navigate', href };
  }

  const challengeId = readId(item.data, 'challenge_id');
  if (challengeId) {
    return { kind: 'navigate', href: DefisRoutes.challengeDetail(challengeId) };
  }

  if (item.type === 'admin_notice' || item.type === 'duel_admin') {
    return { kind: 'message' };
  }

  if (item.body?.trim()) {
    return { kind: 'message' };
  }

  return { kind: 'none' };
}

export function isNotificationPressable(item: AppNotification): boolean {
  return getNotificationPressAction(item).kind !== 'none';
}
