import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

import { playQuizSoundForSlot } from '@services/quiz/play/playQuizSoundForSlot';

/**
 * Retour haptique, vibration (Android) et son choisi pour une mauvaise réponse ou le temps écoulé.
 */
export async function triggerQuizWrongFeedback(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // haptics indisponible
  }
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 100, 50, 100]);
  }
  await playQuizSoundForSlot('wrongAnswer');
}
