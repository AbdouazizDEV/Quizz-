import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { CountdownTimer } from '@components/atoms/CountdownTimer';
import { COLORS } from '@constants/Colors';

interface DuelIncomingModalProps {
  visible: boolean;
  challengerName: string;
  questionsCount: number;
  expiresAt: string;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

export function DuelIncomingModal({
  visible,
  challengerName,
  questionsCount,
  expiresAt,
  onAccept,
  onDecline,
  onClose,
}: DuelIncomingModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconBubble}>
            <Text style={styles.icon}>🎯</Text>
          </View>
          <Text style={styles.title}>Nouveau défi reçu !</Text>
          <Text style={styles.body}>
            <Text style={styles.highlight}>{challengerName}</Text> vous a défié. Consultez les
            détails ci-dessous et acceptez pour commencer la partie.
          </Text>
          <View style={styles.metaBox}>
            <Text style={styles.metaLine}>📋 {questionsCount} questions</Text>
            <CountdownTimer endsAt={expiresAt} />
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.declineBtn} onPress={onDecline} accessibilityRole="button">
              <Text style={styles.declineLabel}>Refuser</Text>
            </Pressable>
            <Pressable style={styles.acceptBtn} onPress={onAccept} accessibilityRole="button">
              <Text style={styles.acceptLabel}>Accepter →</Text>
            </Pressable>
          </View>
          <Pressable onPress={onClose} accessibilityRole="button">
            <Text style={styles.laterLink}>Répondre plus tard</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 24,
    gap: 12,
    alignItems: 'center',
  },
  iconBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  highlight: {
    color: COLORS.primaryDark,
    fontFamily: 'Nunito_700Bold',
  },
  metaBox: {
    width: '100%',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  metaLine: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  declineBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  declineLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  acceptBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  acceptLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.textLight,
  },
  laterLink: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
