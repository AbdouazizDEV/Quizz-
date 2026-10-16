import { View } from 'react-native';

import { BadgeMedallion } from '@components/ui/badges/BadgeMedallion';
import type { PlayerBadgeView } from '@constants/westAfricanBadges';

export function BadgeChip({ badge }: { badge: PlayerBadgeView }) {
  if (!badge.earned) return null;
  return (
    <View>
      <BadgeMedallion badge={badge} size="sm" />
    </View>
  );
}
