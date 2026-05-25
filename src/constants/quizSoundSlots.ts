import type { QuizSoundPreferences, QuizSoundSlot } from '@app-types/quizSoundPreferences.types';

export interface QuizSoundSlotMeta {
  slot: QuizSoundSlot;
  title: string;
  description: string;
  icon: 'check-circle' | 'x-circle' | 'award' | 'smile' | 'frown';
  iconBackground: string;
  iconColor: string;
}

export const QUIZ_SOUND_SLOT_META: readonly QuizSoundSlotMeta[] = [
  {
    slot: 'correctAnswer',
    title: 'Bonne réponse',
    description: 'Joué à chaque bonne réponse pendant le quiz.',
    icon: 'check-circle',
    iconBackground: '#E8F5E9',
    iconColor: '#2E7D32',
  },
  {
    slot: 'wrongAnswer',
    title: 'Mauvaise réponse',
    description: 'Mauvaise réponse ou temps écoulé.',
    icon: 'x-circle',
    iconBackground: '#FFEBEE',
    iconColor: '#C62828',
  },
  {
    slot: 'victoryPerfect',
    title: 'Victoire parfaite',
    description: 'Toutes les questions du quiz sont correctes.',
    icon: 'award',
    iconBackground: '#FFF8E1',
    iconColor: '#F9A825',
  },
  {
    slot: 'victoryPartial',
    title: 'Bonne performance',
    description: 'Au moins la moitié des bonnes réponses, sans tout réussir.',
    icon: 'smile',
    iconBackground: '#E3F2FD',
    iconColor: '#1565C0',
  },
  {
    slot: 'defeat',
    title: 'Score insuffisant',
    description: 'Moins de la moitié des bonnes réponses à la fin du quiz.',
    icon: 'frown',
    iconBackground: '#F3E5F5',
    iconColor: '#6A1B9A',
  },
];

export const DEFAULT_QUIZ_SOUND_PREFERENCES: QuizSoundPreferences = {
  correctAnswer: 'core-sound-effect',
  wrongAnswer: 'mixkit-police-whistle',
  victoryPerfect: 'wakanda',
  victoryPartial: 'mi-gente',
  defeat: 'quiz-wrong-alert',
};
