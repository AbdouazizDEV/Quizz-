import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuizPlayTheme } from '@constants/quizPlayTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';
import type { QuizFeedbackPhase } from '@stores/quizPlaySessionStore';

export interface QuizFeedbackFunFactModalProps {
  visible: boolean;
  phase: Exclude<QuizFeedbackPhase, 'idle'>;
  /** +N pts en cas de bonne réponse */
  pointsEarnedLabel: string;
  /** Texte d’anecdote (explication) ; peut être vide. */
  funFact: string;
  /** Libellé de la bonne réponse (incorrect / temps écoulé). */
  correctAnswerLabel?: string;
  onContinue: () => void;
  fonts: ProfileFontFamilies;
}

function titleForPhase(phase: Exclude<QuizFeedbackPhase, 'idle'>): string {
  if (phase === 'correct') return 'Bonne réponse !';
  if (phase === 'timeout') return 'Temps écoulé';
  return 'Mauvaise réponse';
}

function accentColor(phase: Exclude<QuizFeedbackPhase, 'idle'>): string {
  if (phase === 'correct') return QuizPlayTheme.success;
  if (phase === 'timeout') return '#F59E0B';
  return QuizPlayTheme.error;
}

export function QuizFeedbackFunFactModal({
  visible,
  phase,
  pointsEarnedLabel,
  funFact,
  correctAnswerLabel,
  onContinue,
  fonts,
}: QuizFeedbackFunFactModalProps) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(320)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      slide.setValue(320);
      fade.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 9 }),
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [visible, slide, fade]);

  const accent = accentColor(phase);
  const trimmedFact = funFact.trim();
  const body =
    trimmedFact ||
    (phase === 'correct'
      ? 'Continuez pour garder le rythme.'
      : 'Retenez la bonne réponse pour la prochaine fois.');

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onContinue}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.dim, { opacity: fade }]} />
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(20, insets.bottom + 16),
              transform: [{ translateY: slide }],
            },
          ]}
        >
          <View style={[styles.accentBar, { backgroundColor: accent }]} />
          <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>
            {titleForPhase(phase)}
          </Text>
          {phase === 'correct' ? (
            <Text style={[styles.points, fonts.bold && { fontFamily: fonts.bold }, { color: accent }]}>
              {pointsEarnedLabel}
            </Text>
          ) : null}

          {phase !== 'correct' && correctAnswerLabel ? (
            <Text style={[styles.correctHint, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
              Bonne réponse : {correctAnswerLabel}
            </Text>
          ) : null}

          <Text style={[styles.funFactLabel, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
            Le saviez-vous ?
          </Text>
          <ScrollView
            style={styles.funFactScroll}
            contentContainerStyle={styles.funFactScrollContent}
            showsVerticalScrollIndicator={trimmedFact.length > 200}
          >
            <Text style={[styles.funFactText, fonts.medium && { fontFamily: fonts.medium }]}>{body}</Text>
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={[styles.ctaText, fonts.bold && { fontFamily: fonts.bold }]}>Continuer</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 14,
    maxHeight: '78%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  accentBar: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 100,
    marginBottom: 14,
    opacity: 0.95,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: QuizPlayTheme.grey900,
    textAlign: 'center',
    marginBottom: 6,
  },
  points: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  correctHint: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  funFactLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  funFactScroll: {
    maxHeight: 220,
    marginBottom: 16,
  },
  funFactScrollContent: {
    paddingBottom: 4,
  },
  funFactText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
  },
  cta: {
    height: 54,
    borderRadius: 100,
    backgroundColor: QuizPlayTheme.primaryButton,
    borderBottomWidth: 4,
    borderBottomColor: QuizPlayTheme.primaryButtonBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#212121',
  },
});
