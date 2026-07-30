import type { AppNotification } from '@app-types/notification.types';
import { DefisRoutes } from '@constants/defisRoutes';
import { Routes } from '@constants/Routes';

export type NotificationPressAction =
  | { kind: 'message' }
  | { kind: 'navigate'; href: string }
  | { kind: 'none' };

function readId(data: Record<string, unknown>, key: string): string | null {
  const value = data[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function getNotificationPressAction(item: AppNotification): NotificationPressAction {
  if (
    (item.type === 'friend_request' || item.type === 'duel_request') &&
    !item.isRead
  ) {
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

  if (item.type === 'ranking_update') {
    return { kind: 'navigate', href: DefisRoutes.hub };
  }

    if (item.type === 'streak_reminder') {
      return { kind: 'navigate', href: Routes.HOME };
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
