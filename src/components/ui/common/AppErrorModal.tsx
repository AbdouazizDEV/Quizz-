import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@constants/Colors';

export interface AppErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  retryLabel?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function AppErrorModal({
  visible,
  title,
  message,
  confirmLabel = 'Compris',
  retryLabel = 'Réessayer',
  onClose,
  onRetry,
}: AppErrorModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.dimOverlay} pointerEvents="none" />

        <View style={styles.centerWrap} pointerEvents="box-none">
          <View style={styles.card}>
            <View style={styles.iconRing}>
              <View style={styles.iconBubble}>
                <Feather name="alert-triangle" size={32} color={COLORS.textLight} />
              </View>
            </View>

            <Text style={styles.eyebrow}>Une erreur est survenue</Text>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.messageBox}>
              <Text style={styles.message}>{message}</Text>
            </View>

            <View style={styles.actions}>
              {onRetry ? (
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={onRetry}
                  accessibilityRole="button"
                  accessibilityLabel={retryLabel}
                >
                  <Text style={styles.secondaryLabel}>{retryLabel}</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={[styles.primaryBtn, !onRetry && styles.primaryBtnFull]}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={confirmLabel}
              >
                <Text style={styles.primaryLabel}>{confirmLabel}</Text>
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
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.55)',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: 'rgba(232, 67, 26, 0.35)',
    shadowColor: COLORS.error,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(232, 67, 26, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: COLORS.error,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  messageBox: {
    width: '100%',
    backgroundColor: 'rgba(232, 67, 26, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(232, 67, 26, 0.22)',
    marginTop: 4,
    marginBottom: 6,
  },
  message: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: COLORS.border,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  secondaryLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: COLORS.error,
    shadowColor: COLORS.error,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnFull: {
    flex: 1,
  },
  primaryLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: COLORS.textLight,
  },
});
