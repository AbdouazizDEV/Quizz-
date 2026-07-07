import { useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

import type { AppNotification } from '@app-types/notification.types';
import {
  formatNotificationTime,
  getNotificationVisual,
} from '@services/notifications/notificationPresentation';
import { isNotificationPressable } from '@services/notifications/notificationActions';
import { isPendingDuelRequest } from '@services/notifications/duelNotificationHelpers';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface NotificationListItemProps {
  item: AppNotification;
  fonts: ProfileFontFamilies;
  busy?: boolean;
  onPress: () => void;
  onAcceptFriend?: () => void;
  onRejectFriend?: () => void;
  onAcceptDuel?: () => void;
  onRejectDuel?: () => void;
  onDeleteRequest?: () => void;
}

function DeleteSwipeAction() {
  return (
    <View style={styles.swipeDelete}>
      <Feather name="trash-2" size={20} color="#FFFFFF" />
      <Text style={styles.swipeDeleteText}>Supprimer</Text>
    </View>
  );
}

export function NotificationListItem({
  item,
  fonts,
  busy,
  onPress,
  onAcceptFriend,
  onRejectFriend,
  onAcceptDuel,
  onRejectDuel,
  onDeleteRequest,
}: NotificationListItemProps) {
  const swipeRef = useRef<Swipeable>(null);
  const visual = getNotificationVisual(item.type);
  const isFriendRequest = item.type === 'friend_request' && !item.isRead;
  const isDuelRequest = isPendingDuelRequest(item);
  const pressable = isNotificationPressable(item);

  const cardContent = (
    <>
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

        {isDuelRequest && onAcceptDuel && onRejectDuel ? (
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={onAcceptDuel}
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
              onPress={onRejectDuel}
              disabled={busy}
            >
              <Text style={[styles.actionTxtMuted, fonts.semiBold && { fontFamily: fonts.semiBold }]}>Refuser</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </>
  );

  const card = isFriendRequest || isDuelRequest || !pressable ? (
    <View style={[styles.card, !item.isRead && styles.cardUnread]}>{cardContent}</View>
  ) : (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, !item.isRead && styles.cardUnread, pressed && { opacity: 0.92 }]}
    >
      {cardContent}
    </Pressable>
  );

  if (!onDeleteRequest) {
    return card;
  }

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={DeleteSwipeAction}
      renderRightActions={DeleteSwipeAction}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      onSwipeableOpen={() => {
        swipeRef.current?.close();
        onDeleteRequest();
      }}
    >
      {card}
    </Swipeable>
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
  swipeDelete: {
    width: 108,
    marginVertical: 1,
    borderRadius: 18,
    backgroundColor: '#FF4D4F',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  swipeDeleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
