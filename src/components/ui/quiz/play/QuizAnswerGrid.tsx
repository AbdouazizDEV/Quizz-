import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { QUIZ_OPTION_CARD_STYLES, QuizPlayTheme } from '@constants/quizPlayTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

import type { QuizPlayOption } from '@app-types/quizPlay.types';
import { QuizAnswerOptionCard, type AnswerVisualState } from '@components/ui/quiz/play/QuizAnswerOptionCard';
import { optionsNeedLongBarLayout } from '@utils/quizAnswerLayout';
import { shuffleArray } from '@utils/shuffleArray';

interface QuizAnswerGridProps {
  /** Identifiant question : nouveau mélange à chaque question. */
  questionId: string;
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

export function QuizAnswerGrid({
  questionId,
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

  /** Inclut les libellés pour recalculer si le contenu change (sans reshuffle à chaque render). */
  const answersContentKey = useMemo(
    () =>
      [...options]
        .map((o) => `${o.id}:${o.label}`)
        .sort()
        .join('|'),
    [options],
  );

  const longBarLayout = useMemo(
    () => optionsNeedLongBarLayout(options),
    [answersContentKey, options],
  );

  const displayOptions = useMemo(
    () => shuffleArray([...options]),
    [questionId, answersContentKey],
  );

  const squareSize = longBarLayout ? 0 : (columnWidth - gap) / 2;

  if (longBarLayout) {
    return (
      <View style={[styles.stack, { width: columnWidth, gap }]}>
        {displayOptions.map((opt, i) => {
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
              variant="bar"
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

  return (
    <View style={[styles.grid, { width: columnWidth, gap }]}>
      {displayOptions.map((opt, i) => {
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
            variant="square"
            squareSize={squareSize}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
  },
});
