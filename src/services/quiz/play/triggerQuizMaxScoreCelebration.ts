import { playBundledSound } from '@services/quiz/play/quizSoundPlayer';

const MAX_SCORE_CELEBRATION = require('../../../../assets/sounds/wakanda.mp3');

/** Son de célébration lorsque le joueur atteint le score maximum du quiz. */
export async function triggerQuizMaxScoreCelebration(): Promise<void> {
  await playBundledSound(MAX_SCORE_CELEBRATION);
}
