import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

const WRONG_ALERT = require('../../../../assets/sounds/quiz-wrong-alert.mp3');

let wrongSound: Audio.Sound | null = null;

async function playWrongAlert(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    if (!wrongSound) {
      const { sound } = await Audio.Sound.createAsync(WRONG_ALERT);
      wrongSound = sound;
    }
    await wrongSound.setPositionAsync(0);
    await wrongSound.playAsync();
  } catch {
    // Web ou module audio indisponible
  }
}

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
  await playWrongAlert();
}
