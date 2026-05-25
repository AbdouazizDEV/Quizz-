import type { AppNotification, NotificationFilter, NotificationsPage } from '@app-types/notification.types';

export interface INotificationsPort {
  list(params: { filter: NotificationFilter; page: number; limit?: number }): Promise<NotificationsPage>;
  markRead(notificationId: string): Promise<void>;
  markAllRead(): Promise<void>;
  remove(notificationId: string): Promise<void>;
}
