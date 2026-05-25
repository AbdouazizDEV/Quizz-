/** Entrée du catalogue — `asset` est l’id numérique Metro (require). */
export interface QuizSoundCatalogEntry {
  id: string;
  label: string;
  fileName: string;
  asset: number;
}

/**
 * Tous les fichiers audio de assets/sounds/ (hors images).
 * Metro exige des require statiques — ajouter ici tout nouveau .mp3/.wav.
 */
export const QUIZ_SOUND_CATALOG: readonly QuizSoundCatalogEntry[] = [
  {
    id: 'alert-sound',
    label: 'Alerte',
    fileName: 'alert-sound_wTmioMp.mp3',
    asset: require('../../assets/sounds/alert-sound_wTmioMp.mp3'),
  },
  {
    id: 'core-sound-effect',
    label: 'Effet core',
    fileName: 'core-sound-effect.mp3',
    asset: require('../../assets/sounds/core-sound-effect.mp3'),
  },
  {
    id: 'faaah',
    label: 'Faaah',
    fileName: 'faaah.mp3',
    asset: require('../../assets/sounds/faaah.mp3'),
  },
  {
    id: 'gorilla-chant-remix',
    label: 'Gorilla chant remix',
    fileName: '🔥 Spotify Remixes Ep. 5.  Mbaku Maefa! Jabari Tribe Gorilla Chant Remix_MP3.mp3',
    asset: require('../../assets/sounds/🔥 Spotify Remixes Ep. 5.  Mbaku Maefa! Jabari Tribe Gorilla Chant Remix_MP3.mp3'),
  },
  {
    id: 'mi-gente',
    label: 'Mi gente (live edit)',
    fileName: 'mi-gente-sountec-live-edit.mp3',
    asset: require('../../assets/sounds/mi-gente-sountec-live-edit.mp3'),
  },
  {
    id: 'mixkit-police-whistle',
    label: 'Sifflet police',
    fileName: 'mixkit-police-whistle-614.wav',
    asset: require('../../assets/sounds/mixkit-police-whistle-614.wav'),
  },
  {
    id: 'omg',
    label: 'OMG',
    fileName: 'omg-oh-hell-nah-clean.mp3',
    asset: require('../../assets/sounds/omg-oh-hell-nah-clean.mp3'),
  },
  {
    id: 'quiz-wrong-alert',
    label: 'Alerte mauvaise réponse',
    fileName: 'quiz-wrong-alert.mp3',
    asset: require('../../assets/sounds/quiz-wrong-alert.mp3'),
  },
  {
    id: 'wakanda',
    label: 'Wakanda',
    fileName: 'wakanda.mp3',
    asset: require('../../assets/sounds/wakanda.mp3'),
  },
] as const;

export type QuizSoundId = (typeof QUIZ_SOUND_CATALOG)[number]['id'];

const catalogById = new Map(QUIZ_SOUND_CATALOG.map((e) => [e.id, e]));

export function getQuizSoundById(id: string): QuizSoundCatalogEntry | undefined {
  return catalogById.get(id);
}

export function getQuizSoundLabel(id: string): string {
  return catalogById.get(id)?.label ?? id;
}
