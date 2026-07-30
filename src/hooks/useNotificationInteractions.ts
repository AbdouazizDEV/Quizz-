import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';

import type { AppNotification } from '@app-types/notification.types';
import { getNotificationPressAction } from '@services/notifications/notificationActions';

interface UseNotificationInteractionsOptions {
  markRead: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  onNavigate?: () => void;
}

export function useNotificationInteractions({
  markRead,
  remove,
  onNavigate,
}: UseNotificationInteractionsOptions) {
  const router = useRouter();
  const [messageItem, setMessageItem] = useState<AppNotification | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppNotification | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const handlePress = useCallback(
    async (item: AppNotification) => {
      if (!item.isRead) {
        await markRead(item.id);
      }

      const action = getNotificationPressAction(item);
      if (action.kind === 'message') {
        setMessageItem(item);
        return;
      }
      if (action.kind === 'navigate') {
        onNavigate?.();
        router.push(action.href as never);
      }
    },
    [markRead, onNavigate, router],
  );

  const requestDelete = useCallback((item: AppNotification) => {
    setDeleteTarget(item);
  }, []);

  const cancelDelete = useCallback(() => {
    if (deleteBusy) return;
    setDeleteTarget(null);
  }, [deleteBusy]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget || deleteBusy) return;
    setDeleteBusy(true);
    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleteBusy(false);
    }
  }, [deleteBusy, deleteTarget, remove]);

  const closeMessage = useCallback(() => {
    setMessageItem(null);
  }, []);

  return {
    messageItem,
    deleteTarget,
    deleteBusy,
    handlePress,
    requestDelete,
    cancelDelete,
    confirmDelete,
    closeMessage,
  };
}
