import type { AppNotification } from '@app-types/notification.types';

/** Non lues en premier, puis plus récentes en haut. */
export function sortNotifications(items: AppNotification[]): AppNotification[] {
  return [...items].sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
