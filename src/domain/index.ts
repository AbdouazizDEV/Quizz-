/**
 * Domain layer — règles métier pures (SOLID).
 * Aucun I/O ici : quiz scoring, composition, notifications policies.
 */
export * from './quiz/difficultyPoints';
export * from './quiz/seededRandom';
export * from './quiz/buildQuizQuestionSet';
export * from './quiz/computeSessionScore';
export * from './quiz/estimateMaxScore';
export * from './notifications/streakReminderPolicy';
export * from './notifications/notificationEventTypes';
