export type NotificationFilter = 'all' | 'unread';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsPage {
  items: AppNotification[];
  page: number;
  limit: number;
  total: number;
  unreadCount: number;
}
