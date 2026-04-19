import { create } from 'zustand';

import type { QuizAnswerRecord, QuizPlayPayload, QuizPlayQuestion } from '@app-types/quizPlay.types';

export type QuizFeedbackPhase = 'idle' | 'correct' | 'incorrect';

const clearFeedbackFields = {
  selectedOptionId: null as string | null,
  feedbackPhase: 'idle' as QuizFeedbackPhase,
  lastPointsEarned: 0,
  feedbackChipLabel: '',
  correctAnswerLabel: '',
};

interface QuizPlaySessionState {
  categorySlug: string | null;
  payload: QuizPlayPayload | null;
  currentIndex: number;
  sessionPoints: number;
  answers: QuizAnswerRecord[];
  selectedOptionId: string | null;
  feedbackPhase: QuizFeedbackPhase;
  lastPointsEarned: number;
  feedbackChipLabel: string;
  correctAnswerLabel: string;
  secondsPerQuestion: number;
  reset: () => void;
  bootstrap: (payload: QuizPlayPayload, categorySlug: string | null) => void;
  selectOption: (optionId: string, isCorrect: boolean, pointsIfCorrect: number, correctLabel: string) => void;
  /** Après « Suivant » : enregistre la réponse courante et passe à la suite ou termine. */
  advanceFromFeedback: () => 'continue' | 'finished';
  getCurrentQuestion: () => QuizPlayQuestion | null;
}

const initial = {
  categorySlug: null as string | null,
  payload: null as QuizPlayPayload | null,
  currentIndex: 0,
  sessionPoints: 0,
  answers: [] as QuizAnswerRecord[],
  selectedOptionId: null as string | null,
  feedbackPhase: 'idle' as QuizFeedbackPhase,
  lastPointsEarned: 0,
  feedbackChipLabel: '',
  correctAnswerLabel: '',
  secondsPerQuestion: 16,
};

export const useQuizPlaySessionStore = create<QuizPlaySessionState>((set, get) => ({
  ...initial,
  reset: () => set({ ...initial }),
  bootstrap: (payload, categorySlug) =>
    set({
      ...initial,
      payload,
      categorySlug,
    }),
  selectOption: (optionId, isCorrect, pointsIfCorrect, correctLabel) =>
    set({
      selectedOptionId: optionId,
      feedbackPhase: isCorrect ? 'correct' : 'incorrect',
      lastPointsEarned: isCorrect ? pointsIfCorrect : 0,
      feedbackChipLabel: isCorrect ? `+${pointsIfCorrect}` : correctLabel,
      correctAnswerLabel: correctLabel,
      sessionPoints: isCorrect ? get().sessionPoints + pointsIfCorrect : get().sessionPoints,
    }),
  advanceFromFeedback: () => {
    const p = get().payload;
    const idx = get().currentIndex;
    const q = p?.questions[idx];
    const sel = get().selectedOptionId;
    if (!p || !q || !sel) return 'continue';
    const isCorrect = sel === q.correctOptionId;
    const record: QuizAnswerRecord = {
      questionId: q.id,
      selectedOptionId: sel,
      correctOptionId: q.correctOptionId,
      isCorrect,
    };
    const answers = [...get().answers, record];
    const isLast = idx >= p.questions.length - 1;
    if (isLast) {
      set({
        answers,
        ...clearFeedbackFields,
      });
      return 'finished';
    }
    set({
      answers,
      currentIndex: idx + 1,
      ...clearFeedbackFields,
    });
    return 'continue';
  },
  getCurrentQuestion: () => {
    const { payload, currentIndex } = get();
    if (!payload?.questions.length) return null;
    return payload.questions[currentIndex] ?? null;
  },
}));
