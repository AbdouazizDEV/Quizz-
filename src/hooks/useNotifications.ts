import { useCallback, useEffect, useState } from 'react';

import type { AppNotification, NotificationFilter } from '@app-types/notification.types';
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from '@services/network/friendRequestsApi';
import { apiAcceptDuel, apiDeclineDuel } from '@services/defis/duelApi';
import { readDuelIdFromNotification } from '@services/notifications/duelNotificationHelpers';
import { getNotificationsProvider } from '@services/notifications/notificationsProviderInstance';
import { useAuthStore } from '@stores/authStore';

export function useNotifications() {
  const token = useAuthStore((s) => s.token);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const hasMore = items.length < total;

  const loadPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      if (!token?.trim()) {
        setItems([]);
        setLoading(false);
        return;
      }
      if (replace) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const res = await getNotificationsProvider().list({ filter, page: pageNum, limit: 25 });
        setUnreadCount(res.unreadCount);
        setTotal(res.total);
        setPage(res.page);
        setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter, token],
  );

  useEffect(() => {
    void loadPage(1, true);
  }, [loadPage]);

  const refresh = useCallback(async () => {
    await loadPage(1, true);
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    await loadPage(page + 1, false);
  }, [hasMore, loadPage, loadingMore, page]);

  const markRead = useCallback(async (id: string) => {
    await getNotificationsProvider().markRead(id);
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await getNotificationsProvider().markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const remove = useCallback(
    async (id: string) => {
      await getNotificationsProvider().remove(id);
      await refresh();
    },
    [refresh],
  );

  const acceptFriend = useCallback(
    async (notificationId: string) => {
      setActionId(notificationId);
      try {
        await acceptFriendRequest(notificationId);
        await refresh();
      } finally {
        setActionId(null);
      }
    },
    [refresh],
  );

  const rejectFriend = useCallback(
    async (notificationId: string) => {
      setActionId(notificationId);
      try {
        await rejectFriendRequest(notificationId);
        await refresh();
      } finally {
        setActionId(null);
      }
    },
    [refresh],
  );

  const acceptDuel = useCallback(
    async (notification: AppNotification): Promise<string> => {
      const duelId = readDuelIdFromNotification(notification);
      if (!duelId) throw new Error('Duel introuvable.');
      setActionId(notification.id);
      try {
        if (!notification.isRead) {
          await getNotificationsProvider().markRead(notification.id);
          setItems((prev) =>
            prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
          );
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        await apiAcceptDuel(duelId);
        await refresh();
        return duelId;
      } finally {
        setActionId(null);
      }
    },
    [refresh],
  );

  const rejectDuel = useCallback(
    async (notification: AppNotification) => {
      const duelId = readDuelIdFromNotification(notification);
      if (!duelId) throw new Error('Duel introuvable.');
      setActionId(notification.id);
      try {
        if (!notification.isRead) {
          await getNotificationsProvider().markRead(notification.id);
        }
        await apiDeclineDuel(duelId);
        await refresh();
      } finally {
        setActionId(null);
      }
    },
    [refresh],
  );

  return {
    filter,
    setFilter,
    items,
    unreadCount,
    loading,
    loadingMore,
    error,
    hasMore,
    actionId,
    refresh,
    loadMore,
    markRead,
    markAllRead,
    remove,
    acceptFriend,
    rejectFriend,
    acceptDuel,
    rejectDuel,
  };
}
