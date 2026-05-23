import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface QuizReplayInfoModalProps {
  visible: boolean;
  quizTitle: string;
  bestScore: number;
  maxScore: number;
  missingPoints: number;
  onContinue: () => void;
  onCancel: () => void;
  fonts: ProfileFontFamilies;
}

export function QuizReplayInfoModal({
  visible,
  quizTitle,
  bestScore,
  maxScore,
  missingPoints,
  onContinue,
  onCancel,
  fonts,
}: QuizReplayInfoModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>
            Rejouer ce quiz
          </Text>
          <Text style={[styles.body, fonts.medium && { fontFamily: fonts.medium }]}>
            {quizTitle}
          </Text>
          <Text style={[styles.body, fonts.medium && { fontFamily: fonts.medium }]}>
            Votre meilleur score : {bestScore} / {maxScore} pts
          </Text>
          <Text style={[styles.highlight, fonts.bold && { fontFamily: fonts.bold }]}>
            Il vous reste {missingPoints} pt{missingPoints > 1 ? 's' : ''} à gagner sur ce quiz.
          </Text>
          <Text style={[styles.hint, fonts.medium && { fontFamily: fonts.medium }]}>
            Seuls les points manquants seront ajoutés à votre profil.
          </Text>
          <View style={styles.actions}>
            <Pressable style={styles.secondaryBtn} onPress={onCancel} accessibilityRole="button">
              <Text style={[styles.secondaryLabel, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
                Annuler
              </Text>
            </Pressable>
            <Pressable style={styles.primaryBtn} onPress={onContinue} accessibilityRole="button">
              <Text style={[styles.primaryLabel, fonts.bold && { fontFamily: fonts.bold }]}>
                Continuer
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212121',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#424242',
  },
  highlight: {
    fontSize: 16,
    lineHeight: 24,
    color: '#C9A000',
    marginTop: 4,
  },
  hint: {
    fontSize: 13,
    lineHeight: 20,
    color: '#757575',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  secondaryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#424242',
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    alignItems: 'center',
  },
  primaryLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#212121',
  },
});
