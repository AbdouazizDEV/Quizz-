import { Typography } from '@constants/Typography';

/** Familles Nunito résolues après chargement des polices (évite la duplication par composant). */
export type ProfileFontFamilies = {
  extraBold?: string;
  bold?: string;
  semiBold?: string;
  medium?: string;
};

/** Titres ExtraBold, corps SemiBold, mentions Regular — plus de fontWeight système. */
export const profileFonts: ProfileFontFamilies = {
  extraBold: Typography.extraBold,
  bold: Typography.extraBold,
  semiBold: Typography.semiBold,
  medium: Typography.regular,
};
