import { ProfileTheme } from '@constants/profileTheme';

/** Tokens dédiés à l’écran Réseaux (alignés maquette Figma / capture). */
export const NetworkTheme = {
  ...ProfileTheme,
  /** Padding page : 16 top, 24 horizontal, 48 bottom (+ safe area géré à l’écran). */
  pagePaddingTop: 16,
  pagePaddingX: 24,
  pagePaddingBottom: 48,
  /** Espace entre le bloc navbar + filtres et la liste. */
  headerToListGap: 28,
  /** Espace vertical entre deux lignes de compte. */
  listRowGap: 20,
  /** Hauteur cible d’une ligne (Account List). */
  accountRowMinHeight: 60,
  /** Espacement avatar — texte — bouton. */
  accountRowInnerGap: 12,
  /** Jaune boutons / bordures (cohérent avec la maquette). */
  accentYellow: '#FFB703',
  accentYellowText: '#C9A000',
  /** Fond liste : blanc pur (contenu) sur page légèrement nuancée si besoin. */
  listSurface: '#FFFFFF',
} as const;
