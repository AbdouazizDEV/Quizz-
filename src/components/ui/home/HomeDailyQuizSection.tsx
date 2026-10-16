import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { DailyQuizCard, DailyQuizSlot } from '@app-types/dailyQuiz.types';
import { formatLevelCodeLabel } from '@utils/levelDisplay';

const SLOT_ICONS: Record<DailyQuizSlot, ComponentProps<typeof Feather>['name']> = {
  popular: 'trending-up',
  profile: 'user',
  recent: 'clock',
};

interface HomeDailyQuizSectionProps {
  quizzes: DailyQuizCard[];
  loading: boolean;
  onPressQuiz: (quiz: DailyQuizCard) => void;
}

function difficultyLabel(level: string | null): string {
  if (!level) return 'Tous niveaux';
  return formatLevelCodeLabel(level).replace(/^[^\s]+\s/, '');
}

export function HomeDailyQuizSection({ quizzes, loading, onPressQuiz }: HomeDailyQuizSectionProps) {
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#B88700" />
      </View>
    );
  }

  if (quizzes.length === 0) {
    return <Text style={styles.empty}>Aucun quiz du jour pour le moment.</Text>;
  }

  return (
    <View style={styles.quizColumn}>
      {quizzes.map((quiz) => {
        const disabled = !quiz.isPlayable;
        const meta = `${quiz.questionCount} questions · ${difficultyLabel(quiz.difficultyLevel)}`;

        return (
          <Pressable
            key={`${quiz.slot}-${quiz.id}`}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={() => onPressQuiz(quiz)}
            style={({ pressed }) => [
              styles.quizCard,
              disabled && styles.quizCardDisabled,
              pressed && !disabled && styles.pressed,
            ]}
          >
            {quiz.thumbnailUrl ? (
              <Image source={{ uri: quiz.thumbnailUrl }} style={styles.thumb} />
            ) : (
              <View style={styles.quizIconWrap}>
                <Feather name={SLOT_ICONS[quiz.slot]} size={18} color="#B88700" />
              </View>
            )}
            <View style={styles.quizTextWrap}>
              <Text style={styles.slotLabel}>{quiz.label}</Text>
              <Text style={[styles.quizTitle, disabled && styles.quizTitleDisabled]} numberOfLines={1}>
                {quiz.title}
              </Text>
              <Text style={styles.quizMeta}>{meta}</Text>
              {disabled ? (
                <Text style={styles.completedHint}>Terminé — nouveaux quiz à 00h00</Text>
              ) : null}
            </View>
            {disabled ? (
              <Feather name="check-circle" size={18} color="#9CA3AF" />
            ) : (
              <Feather name="chevron-right" size={18} color="#A1A1AA" />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  quizColumn: {
    gap: 10,
  },
  loading: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quizCardDisabled: {
    opacity: 0.72,
    backgroundColor: '#FAFAFA',
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  quizIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,215,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizTextWrap: {
    flex: 1,
    gap: 2,
  },
  slotLabel: {
    color: '#B88700',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  quizTitle: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '700',
  },
  quizTitleDisabled: {
    color: '#6B7280',
  },
  quizMeta: {
    color: '#6B7280',
    fontSize: 13,
  },
  completedHint: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
