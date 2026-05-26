import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import type { DailyQuiz } from '@app-types/challenge.types';
import { CHALLENGE_UI } from '@constants/challengeUiTheme';
import { COLORS } from '@constants/Colors';

interface ChallengeQuizMissionRowProps {
  quiz: DailyQuiz;
  index: number;
  isLast: boolean;
  onStart: () => void;
}

function statusForQuiz(quiz: DailyQuiz): 'done' | 'locked' | 'ready' {
  if (quiz.isPlayed) return 'done';
  if (!quiz.isAvailable) return 'locked';
  return 'ready';
}

export function ChallengeQuizMissionRow({ quiz, index, isLast, onStart }: ChallengeQuizMissionRowProps) {
  const status = statusForQuiz(quiz);
  const scheduledLabel = new Date(`${quiz.scheduledDay}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <View style={[styles.wrap, !isLast && styles.border]}>
      <View style={styles.header}>
        <View style={[styles.dayBubble, status === 'done' && styles.dayBubbleDone]}>
          <Text style={styles.dayNum}>{index + 1}</Text>
        </View>
        <View style={styles.titleCol}>
          <Text style={styles.title} numberOfLines={2}>
            {quiz.title}
          </Text>
          <Text style={styles.meta}>
            {quiz.difficulty} · {Math.max(1, Math.round(quiz.maxScore / 3))} questions
          </Text>
        </View>
        <StatusChip status={status} />
      </View>

      {status === 'done' ? (
        <View style={styles.resultRow}>
          <Feather name="check-circle" size={18} color={COLORS.success} />
          <Text style={styles.scoreText}>{quiz.userScore ?? 0} pts</Text>
          <Text style={styles.doneHint}>Terminé · pas de rejouer</Text>
        </View>
      ) : null}

      {status === 'locked' ? (
        <View style={styles.lockedRow}>
          <Feather name="lock" size={16} color={COLORS.textSecondary} />
          <Text style={styles.lockedText}>Disponible le {scheduledLabel}</Text>
        </View>
      ) : null}

      {status === 'ready' ? (
        <View style={styles.readyBlock}>
          <View style={styles.warnRow}>
            <Feather name="alert-circle" size={14} color={CHALLENGE_UI.goldDark} />
            <Text style={styles.warnText}>Une seule tentative dans ce challenge</Text>
          </View>
          <Pressable onPress={onStart} style={({ pressed }) => [pressed && { opacity: 0.92 }]}>
            <LinearGradient
              colors={['#FFD54A', '#FFB703']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              <Feather name="play" size={18} color={CHALLENGE_UI.navy} />
              <Text style={styles.ctaText}>Commencer le quiz</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function StatusChip({ status }: { status: 'done' | 'locked' | 'ready' }) {
  const config = {
    done: { label: 'Validé', bg: '#E8F5E9', color: '#2E7D32', icon: 'check' as const },
    locked: { label: 'Bientôt', bg: '#F5F5F5', color: '#757575', icon: 'clock' as const },
    ready: { label: 'À jouer', bg: '#FFF8E1', color: CHALLENGE_UI.navy, icon: 'play-circle' as const },
  }[status];

  return (
    <View style={[styles.chip, { backgroundColor: config.bg }]}>
      <Feather name={config.icon} size={12} color={config.color} />
      <Text style={[styles.chipText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 16, gap: 12 },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dayBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: CHALLENGE_UI.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBubbleDone: {
    backgroundColor: '#E8F5E9',
    borderColor: COLORS.success,
  },
  dayNum: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: CHALLENGE_UI.navy,
  },
  titleCol: { flex: 1, gap: 4 },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 21,
  },
  meta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  chipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginLeft: 48,
  },
  scoreText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: CHALLENGE_UI.goldDark,
  },
  doneHint: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 48,
  },
  lockedText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  readyBlock: { gap: 10, marginLeft: 48 },
  warnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  warnText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: CHALLENGE_UI.goldDark,
    flex: 1,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: CHALLENGE_UI.cardShadow,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  ctaText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: CHALLENGE_UI.navy,
  },
});
