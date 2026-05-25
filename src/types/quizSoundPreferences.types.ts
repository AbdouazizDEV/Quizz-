/** Événements pour lesquels le joueur peut choisir un son. */
export type QuizSoundSlot =
  | 'correctAnswer'
  | 'wrongAnswer'
  | 'victoryPerfect'
  | 'victoryPartial'
  | 'defeat';

export type QuizSoundPreferences = Record<QuizSoundSlot, string>;
