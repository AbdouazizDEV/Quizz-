import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

import { playBundledSound } from '@services/quiz/play/quizSoundPlayer';

const WRONG_ANSWER_SOUND = require('../../../../assets/sounds/mixkit-police-whistle-614.wav');

/**
 * Retour haptique, vibration (Android) et court signal sonore pour une mauvaise réponse ou le temps écoulé.
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
  await playBundledSound(WRONG_ANSWER_SOUND);
}
