/**
 * Métriques adaptées à la largeur d’écran pour la liste Réseaux
 * (évite la troncature excessive des noms sur petits téléphones).
 */

const COMPACT_W = 360;
const MEDIUM_W = 400;

export interface ConnectionRowMetrics {
  avatarSize: number;
  rowGap: number;
  buttonPaddingH: number;
  buttonMinWidth: number;
  nameFontSize: number;
  handleFontSize: number;
  rowMinHeight: number;
  nameMaxLines: number;
  actionFontSize: number;
}

export function getConnectionRowMetrics(screenWidth: number): ConnectionRowMetrics {
  if (screenWidth < COMPACT_W) {
    return {
      avatarSize: 44,
      rowGap: 8,
      buttonPaddingH: 10,
      buttonMinWidth: 72,
      nameFontSize: 15,
      handleFontSize: 13,
      rowMinHeight: 64,
      nameMaxLines: 2,
      actionFontSize: 12,
    };
  }
  if (screenWidth < MEDIUM_W) {
    return {
      avatarSize: 48,
      rowGap: 10,
      buttonPaddingH: 12,
      buttonMinWidth: 80,
      nameFontSize: 15,
      handleFontSize: 13,
      rowMinHeight: 62,
      nameMaxLines: 2,
      actionFontSize: 12,
    };
  }
  return {
    avatarSize: 52,
    rowGap: 12,
    buttonPaddingH: 14,
    buttonMinWidth: 88,
    nameFontSize: 16,
    handleFontSize: 14,
    rowMinHeight: 60,
    nameMaxLines: 1,
    actionFontSize: 13,
  };
}

/** Padding horizontal page : un peu plus étroit sur très petits écrans. */
export function getNetworkHorizontalPadding(screenWidth: number): number {
  return screenWidth < COMPACT_W ? 16 : 24;
}
