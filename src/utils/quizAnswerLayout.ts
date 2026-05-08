import type { QuizPlayOption } from '@app-types/quizPlay.types';

/** Nombre de mots (séparés par des espaces), pour décider barre vs carré. */
export function countWords(label: string): number {
  return label
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Barres horizontales pleine largeur si au moins une réponse dépasse 4 mots.
 * Sinon grille de carrés (réponses courtes : années, un mot, etc.).
 */
export function optionsNeedLongBarLayout(options: Pick<QuizPlayOption, 'label'>[]): boolean {
  return options.some((o) => countWords(o.label) > 4);
}
