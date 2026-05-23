import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { CountdownTimer } from '@components/atoms/CountdownTimer';
import { COLORS } from '@constants/Colors';

interface DuelSentModalProps {
  visible: boolean;
  friendName: string;
  questionsCount: number;
  expiresAt: string;
  onPlayNow: () => void;
  onLater: () => void;
}

export function DuelSentModal({
  visible,
  friendName,
  questionsCount,
  expiresAt,
  onPlayNow,
  onLater,
}: DuelSentModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconBubble}>
            <Text style={styles.icon}>⚡</Text>
          </View>
          <Text style={styles.title}>Défi envoyé !</Text>
          <Text style={styles.body}>
            <Text style={styles.highlight}>{friendName}</Text> a bien reçu votre défi. Une
            notification lui a été envoyée avec tous les détails.
          </Text>
          <View style={styles.metaBox}>
            <Text style={styles.metaLine}>📋 {questionsCount} questions</Text>
            <CountdownTimer endsAt={expiresAt} />
          </View>
          <Text style={styles.hint}>
            Vous pouvez jouer vos questions dès maintenant. Votre ami devra accepter le défi pour
            jouer de son côté.
          </Text>
          <View style={styles.actions}>
            <Pressable style={styles.secondaryBtn} onPress={onLater} accessibilityRole="button">
              <Text style={styles.secondaryLabel}>Plus tard</Text>
            </Pressable>
            <Pressable style={styles.primaryBtn} onPress={onPlayNow} accessibilityRole="button">
              <Text style={styles.primaryLabel}>Jouer maintenant →</Text>
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
    color: COLORS.primary,
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
  hint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
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
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  secondaryLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  primaryLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.textLight,
  },
});
