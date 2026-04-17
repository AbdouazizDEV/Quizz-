import { ViewStyle } from 'react-native';

import { Spacing } from './Spacing';

/** Colonne centrée, pleine largeur jusqu’au plafond maquette (téléphones étroits inclus). */
export const onboardingColumn: ViewStyle = {
  width: '100%',
  maxWidth: Spacing.onboardingMaxWidth,
  alignSelf: 'center',
};
