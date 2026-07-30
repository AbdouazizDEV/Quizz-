import type { AppNotification } from '@app-types/notification.types';

export function readDuelIdFromNotification(item: AppNotification): string | null {
  const value = item.data?.duel_id;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function isPendingDuelRequest(item: AppNotification): boolean {
  return item.type === 'duel_request' && !item.isRead && Boolean(readDuelIdFromNotification(item));
}
