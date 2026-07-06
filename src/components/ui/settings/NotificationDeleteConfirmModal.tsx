import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppNotification } from '@app-types/notification.types';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface NotificationDeleteConfirmModalProps {
  item: AppNotification | null;
  busy?: boolean;
  fonts: ProfileFontFamilies;
  onCancel: () => void;
  onConfirm: () => void;
}

export function NotificationDeleteConfirmModal({
  item,
  busy,
  fonts,
  onCancel,
  onConfirm,
}: NotificationDeleteConfirmModalProps) {
  if (!item) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={busy ? undefined : onCancel} />
        <View style={styles.card}>
          <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>
            Supprimer cette notification ?
          </Text>
          <Text style={[styles.body, fonts.medium && { fontFamily: fonts.medium }]} numberOfLines={3}>
            {item.title}
          </Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              disabled={busy}
              style={[styles.btn, styles.cancelBtn, busy && styles.btnDisabled]}
            >
              <Text style={[styles.cancelText, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
                Annuler
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={busy}
              style={[styles.btn, styles.confirmBtn, busy && styles.btnDisabled]}
            >
              <Text style={[styles.confirmText, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
                Supprimer
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#212121',
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: '#616161',
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmBtn: {
    backgroundColor: '#FF4D4F',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#616161',
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
