import * as Haptics from 'expo-haptics';

import { playQuizSoundForSlot } from '@services/quiz/play/playQuizSoundForSlot';

/** Retour haptique et son choisi pour une bonne réponse. */
export async function triggerQuizCorrectFeedback(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // haptics indisponible
  }
  await playQuizSoundForSlot('correctAnswer');
}
