import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { AppNotification } from '@app-types/notification.types';
import {
  formatNotificationTime,
  getNotificationVisual,
} from '@services/notifications/notificationPresentation';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface NotificationListItemProps {
  item: AppNotification;
  fonts: ProfileFontFamilies;
  busy?: boolean;
  onPress: () => void;
  onAcceptFriend?: () => void;
  onRejectFriend?: () => void;
  onDelete?: () => void;
}

export function NotificationListItem({
  item,
  fonts,
  busy,
  onPress,
  onAcceptFriend,
  onRejectFriend,
  onDelete,
}: NotificationListItemProps) {
  const visual = getNotificationVisual(item.type);
  const isFriendRequest = item.type === 'friend_request' && !item.isRead;

  const Wrapper = isFriendRequest ? View : Pressable;
  const wrapperProps = isFriendRequest
    ? { style: [styles.card, !item.isRead && styles.cardUnread] }
    : {
        onPress,
        style: ({ pressed }: { pressed: boolean }) => [
          styles.card,
          !item.isRead && styles.cardUnread,
          pressed && { opacity: 0.92 },
        ],
      };

  return (
    <Wrapper {...wrapperProps}>
      <View style={[styles.iconBubble, { backgroundColor: visual.iconBackground }]}>
        <Feather name={visual.icon} size={20} color={visual.iconColor} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, !item.isRead && styles.titleUnread, fonts.semiBold && { fontFamily: fonts.semiBold }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {!item.isRead ? <View style={[styles.dot, { backgroundColor: visual.accent }]} /> : null}
        </View>
        {item.body ? (
          <Text style={[styles.bodyTxt, fonts.medium && { fontFamily: fonts.medium }]} numberOfLines={3}>
            {item.body}
          </Text>
        ) : null}
        <Text style={[styles.time, fonts.medium && { fontFamily: fonts.medium }]}>
          {formatNotificationTime(item.createdAt)}
        </Text>

        {isFriendRequest && onAcceptFriend && onRejectFriend ? (
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={onAcceptFriend}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color="#1F2261" size="small" />
              ) : (
                <Text style={[styles.actionTxt, fonts.semiBold && { fontFamily: fonts.semiBold }]}>Accepter</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={onRejectFriend}
              disabled={busy}
            >
              <Text style={[styles.actionTxtMuted, fonts.semiBold && { fontFamily: fonts.semiBold }]}>Refuser</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {onDelete ? (
        <Pressable hitSlop={8} onPress={onDelete} style={styles.deleteHit}>
          <Feather name="trash-2" size={18} color="#BDBDBD" />
        </Pressable>
      ) : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardUnread: {
    backgroundColor: '#FFFDF5',
    borderColor: '#FFE082',
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: { flex: 1, gap: 4, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontSize: 15, fontWeight: '600', color: '#424242', lineHeight: 20 },
  titleUnread: { fontWeight: '800', color: '#212121' },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  bodyTxt: { fontSize: 14, color: '#616161', lineHeight: 19 },
  time: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: {
    flex: 1,
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  acceptBtn: { backgroundColor: '#FFB703' },
  rejectBtn: { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0' },
  actionTxt: { fontSize: 14, fontWeight: '700', color: '#1F2261' },
  actionTxtMuted: { fontSize: 14, fontWeight: '700', color: '#616161' },
  deleteHit: { padding: 4, marginTop: 2 },
});
