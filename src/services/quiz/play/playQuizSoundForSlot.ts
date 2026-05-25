import { getQuizSoundById } from '@constants/quizSoundCatalog';
import { playBundledSound } from '@services/quiz/play/quizSoundPlayer';
import { useQuizSoundPreferencesStore } from '@stores/quizSoundPreferencesStore';
import { useSettingsStore } from '@stores/settingsStore';

import type { QuizSoundSlot } from '@app-types/quizSoundPreferences.types';

export async function playQuizSoundForSlot(slot: QuizSoundSlot): Promise<void> {
  if (!useSettingsStore.getState().musicEnabled) return;

  const soundId = useQuizSoundPreferencesStore.getState().sounds[slot];
  const entry = getQuizSoundById(soundId);
  if (!entry) return;

  await playBundledSound(entry.asset);
}

/** Aperçu depuis les paramètres (ignore le toggle global). */
export async function previewQuizSound(soundId: string): Promise<void> {
  const entry = getQuizSoundById(soundId);
  if (!entry) return;
  await playBundledSound(entry.asset);
}
