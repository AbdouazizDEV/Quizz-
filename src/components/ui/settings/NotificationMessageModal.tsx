import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { AppNotification } from '@app-types/notification.types';
import {
  formatNotificationTime,
  getNotificationVisual,
} from '@services/notifications/notificationPresentation';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface NotificationMessageModalProps {
  item: AppNotification | null;
  fonts: ProfileFontFamilies;
  onClose: () => void;
}

export function NotificationMessageModal({ item, fonts, onClose }: NotificationMessageModalProps) {
  if (!item) return null;

  const visual = getNotificationVisual(item.type);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <View style={[styles.iconBubble, { backgroundColor: visual.iconBackground }]}>
            <Feather name={visual.icon} size={22} color={visual.iconColor} />
          </View>

          <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>{item.title}</Text>
          <Text style={[styles.time, fonts.medium && { fontFamily: fonts.medium }]}>
            {formatNotificationTime(item.createdAt)}
          </Text>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.body, fonts.medium && { fontFamily: fonts.medium }]}>
              {item.body?.trim() || 'Aucun contenu.'}
            </Text>
          </ScrollView>

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeBtnText, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
              Fermer
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    gap: 10,
    maxHeight: '78%',
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#212121',
    textAlign: 'center',
    lineHeight: 24,
  },
  time: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  bodyScroll: {
    maxHeight: 280,
    marginTop: 4,
  },
  body: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: 8,
    backgroundColor: '#FFB703',
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2261',
  },
});
