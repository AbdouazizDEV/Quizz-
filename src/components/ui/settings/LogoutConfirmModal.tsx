import { BlurView } from 'expo-blur';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface LogoutConfirmModalFonts {
  bold?: string;
  semiBold?: string;
}

interface LogoutConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  fonts: LogoutConfirmModalFonts;
}

export function LogoutConfirmModal({
  visible,
  onClose,
  onConfirmLogout,
  fonts,
}: LogoutConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdropTouchable} onPress={onClose}>
          <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.dimOverlay} pointerEvents="none" />
        </Pressable>

        <View style={styles.sheetWrap} pointerEvents="box-none">
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={[styles.title, fonts.bold ? { fontFamily: fonts.bold } : { fontWeight: '700' }]}>
              Déconnexion
            </Text>
            <View style={styles.divider} />
            <Text
              style={[styles.message, fonts.semiBold ? { fontFamily: fonts.semiBold } : { fontWeight: '500' }]}
            >
              Êtes-vous sûr de vouloir vous déconnecter ?
            </Text>

            <View style={styles.actionsRow}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.btnCancel, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Annuler la déconnexion"
              >
                <Text
                  style={[
                    styles.btnCancelLabel,
                    fonts.semiBold ? { fontFamily: fonts.semiBold } : { fontWeight: '600' },
                  ]}
                >
                  Annuler
                </Text>
              </Pressable>
              <Pressable
                onPress={onConfirmLogout}
                style={({ pressed }) => [styles.btnConfirm, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Confirmer la déconnexion"
              >
                <Text
                  style={[
                    styles.btnConfirmLabel,
                    fonts.semiBold ? { fontFamily: fonts.semiBold } : { fontWeight: '700' },
                  ]}
                >
                  Oui, me déconnecter
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  sheetWrap: {
    paddingHorizontal: 0,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    color: '#E53935',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EEEEEE',
    width: '100%',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#212121',
    paddingHorizontal: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btnCancel: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 215, 0, 0.17)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  btnCancelLabel: {
    fontSize: 15,
    color: '#212121',
  },
  btnConfirm: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 215, 0, 0.87)',
    borderBottomWidth: 5,
    borderBottomColor: '#543ACC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  btnConfirmLabel: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000000',
  },
  pressed: {
    opacity: 0.92,
  },
});
