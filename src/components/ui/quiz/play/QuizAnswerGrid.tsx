import { StyleSheet, View } from 'react-native';

import { QUIZ_OPTION_CARD_STYLES, QuizPlayTheme } from '@constants/quizPlayTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

import type { QuizPlayOption } from '@app-types/quizPlay.types';
import { QuizAnswerOptionCard, type AnswerVisualState } from '@components/ui/quiz/play/QuizAnswerOptionCard';

interface QuizAnswerGridProps {
  options: QuizPlayOption[];
  columnWidth: number;
  gap: number;
  fonts: ProfileFontFamilies;
  selectedId: string | null;
  correctId: string;
  revealed: boolean;
  onSelect: (optionId: string) => void;
}

function visualState(
  optId: string,
  selectedId: string | null,
  correctId: string,
  revealed: boolean,
): AnswerVisualState {
  if (!revealed) return 'default';
  if (selectedId === '__timeout__') {
    return optId === correctId ? 'correct' : 'default';
  }
  if (!selectedId) return 'default';
  if (optId === correctId) return 'correct';
  if (optId === selectedId) return 'wrong';
  return 'default';
}

/** Réponses empilées en pleine largeur ; hauteur minimale par carte, contenu extensible pour textes longs. */
export function QuizAnswerGrid({
  options,
  columnWidth,
  gap,
  fonts,
  selectedId,
  correctId,
  revealed,
  onSelect,
}: QuizAnswerGridProps) {
  const minH = QuizPlayTheme.optionCardMinHeight;

  return (
    <View style={[styles.stack, { width: columnWidth, gap }]}>
      {options.map((opt, i) => {
        const styleIdx = i % QUIZ_OPTION_CARD_STYLES.length;
        const palette = QUIZ_OPTION_CARD_STYLES[styleIdx]!;
        const state = visualState(opt.id, selectedId, correctId, revealed);
        return (
          <QuizAnswerOptionCard
            key={opt.id}
            label={opt.label}
            backgroundColor={palette.bg}
            borderBottomColor={palette.border}
            minHeight={minH}
            state={state}
            disabled={revealed}
            fonts={fonts}
            onPress={() => onSelect(opt.id)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    alignSelf: 'stretch',
    alignItems: 'stretch',
  },
});
