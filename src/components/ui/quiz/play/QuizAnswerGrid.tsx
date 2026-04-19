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
  if (!revealed || !selectedId) return 'default';
  if (optId === correctId) return 'correct';
  if (optId !== correctId) return 'wrong';
  return 'default';
}

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
  const cardW = (columnWidth - gap) / 2;
  const cardH = QuizPlayTheme.optionCardHeight;

  const rows: QuizPlayOption[][] = [];
  for (let i = 0; i < options.length; i += 2) {
    rows.push(options.slice(i, i + 2));
  }

  return (
    <View style={[styles.grid, { width: columnWidth, gap }]}>
      {rows.map((row, ri) => (
        <View key={`r-${ri}`} style={[styles.row, { gap }]}>
          {row.map((opt, ci) => {
            const styleIdx = (ri * 2 + ci) % QUIZ_OPTION_CARD_STYLES.length;
            const palette = QUIZ_OPTION_CARD_STYLES[styleIdx]!;
            const state = visualState(opt.id, selectedId, correctId, revealed);
            return (
              <QuizAnswerOptionCard
                key={opt.id}
                label={opt.label}
                backgroundColor={palette.bg}
                borderBottomColor={palette.border}
                width={cardW}
                height={cardH}
                state={state}
                disabled={revealed}
                fonts={fonts}
                onPress={() => onSelect(opt.id)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
  },
});
