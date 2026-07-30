import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { AppNotification } from '@app-types/notification.types';
import { NotificationListItem } from '@components/ui/settings/NotificationListItem';

interface HomeNotificationsSheetProps {
  visible: boolean;
  loading: boolean;
  items: AppNotification[];
  unreadCount: number;
  actionId: string | null;
  onClose: () => void;
  onMarkAllRead: () => void;
  onPressItem: (item: AppNotification) => void;
  onDeleteRequest: (item: AppNotification) => void;
  onAcceptFriend: (id: string) => void;
  onRejectFriend: (id: string) => void;
  onAcceptDuel: (item: AppNotification) => void;
  onRejectDuel: (item: AppNotification) => void;
  onSeeAll: () => void;
}

export function HomeNotificationsSheet({
  visible,
  loading,
  items,
  unreadCount,
  actionId,
  onClose,
  onMarkAllRead,
  onPressItem,
  onDeleteRequest,
  onAcceptFriend,
  onRejectFriend,
  onAcceptDuel,
  onRejectDuel,
  onSeeAll,
}: HomeNotificationsSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.toolbar}>
            {unreadCount > 0 ? (
              <Pressable onPress={onMarkAllRead} style={styles.markAllBtn}>
                <Feather name="check-circle" size={16} color="#1F2261" />
                <Text style={styles.markAllText}>Tout lire</Text>
              </Pressable>
            ) : (
              <View />
            )}
            <Pressable onPress={onSeeAll} style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>Voir tout</Text>
              <Feather name="chevron-right" size={16} color="#C9A000" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {loading && items.length === 0 ? (
              <ActivityIndicator style={styles.loader} color="#FFB703" size="large" />
            ) : items.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Feather name="bell-off" size={28} color="#9E9E9E" />
                </View>
                <Text style={styles.emptyTitle}>Aucune notification</Text>
                <Text style={styles.emptySub}>
                  Les défis, demandes d'amis et annonces apparaîtront ici.
                </Text>
              </View>
            ) : (
              items.map((item) => (
                <NotificationListItem
                  key={item.id}
                  item={item}
                  fonts={{}}
                  busy={actionId === item.id}
                  onPress={() => onPressItem(item)}
                  onAcceptFriend={
                    item.type === 'friend_request' && !item.isRead
                      ? () => onAcceptFriend(item.id)
                      : undefined
                  }
                  onRejectFriend={
                    item.type === 'friend_request' && !item.isRead
                      ? () => onRejectFriend(item.id)
                      : undefined
                  }
                  onAcceptDuel={
                    item.type === 'duel_request' && !item.isRead
                      ? () => onAcceptDuel(item)
                      : undefined
                  }
                  onRejectDuel={
                    item.type === 'duel_request' && !item.isRead
                      ? () => onRejectDuel(item)
                      : undefined
                  }
                  onDeleteRequest={() => onDeleteRequest(item)}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    minHeight: 320,
    maxHeight: '82%',
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: { fontSize: 19, fontWeight: '800', color: '#212121' },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: '#FF4D4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  markAllText: { fontSize: 13, fontWeight: '700', color: '#1F2261' },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  seeAllText: { fontSize: 13, fontWeight: '700', color: '#C9A000' },
  content: { paddingTop: 8, paddingBottom: 8, gap: 10 },
  loader: { marginTop: 32 },
  empty: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 12, gap: 8 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#424242' },
  emptySub: { fontSize: 14, color: '#757575', textAlign: 'center', lineHeight: 20 },
});
