import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_QUIZ_SOUND_PREFERENCES } from '@constants/quizSoundSlots';
import type { QuizSoundPreferences, QuizSoundSlot } from '@app-types/quizSoundPreferences.types';

interface QuizSoundPreferencesState {
  sounds: QuizSoundPreferences;
  setSoundForSlot: (slot: QuizSoundSlot, soundId: string) => void;
  resetToDefaults: () => void;
}

export const useQuizSoundPreferencesStore = create<QuizSoundPreferencesState>()(
  persist(
    (set) => ({
      sounds: { ...DEFAULT_QUIZ_SOUND_PREFERENCES },
      setSoundForSlot: (slot, soundId) =>
        set((state) => ({
          sounds: { ...state.sounds, [slot]: soundId },
        })),
      resetToDefaults: () => set({ sounds: { ...DEFAULT_QUIZ_SOUND_PREFERENCES } }),
    }),
    {
      name: 'quiz-sound-preferences',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ sounds: state.sounds }),
      merge: (persisted, current) => {
        const p = persisted as Partial<QuizSoundPreferencesState> | undefined;
        return {
          ...current,
          sounds: { ...DEFAULT_QUIZ_SOUND_PREFERENCES, ...p?.sounds },
        };
      },
    },
  ),
);
