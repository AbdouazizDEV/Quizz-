import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { StatisticsTheme } from '@constants/statisticsTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

export type StatisticsNavbarRightAction =
  | { type: 'more'; onPress: () => void; accessibilityLabel?: string }
  | { type: 'search'; onPress: () => void; accessibilityLabel?: string };

interface StatisticsNavbarProps {
  title: string;
  fonts: ProfileFontFamilies;
  onBack: () => void;
  /** Icône droite (recherche, menu …). Placeholder invisible si absent pour garder le titre centré. */
  rightAction?: StatisticsNavbarRightAction;
  /** Si true, la barre occupe toute la largeur disponible (pas de max-width 382). */
  fullWidth?: boolean;
}

export function StatisticsNavbar({ title, fonts, onBack, rightAction, fullWidth }: StatisticsNavbarProps) {
  const rightIcon = rightAction?.type === 'search' ? 'search' : 'more-horizontal';
  const rightLabel =
    rightAction?.accessibilityLabel ??
    (rightAction?.type === 'search' ? 'Rechercher' : 'Plus d’options');

  return (
    <View style={[styles.row, !fullWidth && styles.rowConstrained]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        onPress={onBack}
        style={styles.sideHit}
      >
        <Feather name="chevron-left" size={26} color={StatisticsTheme.grey900} />
      </Pressable>
      <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]} numberOfLines={1}>
        {title}
      </Text>
      {rightAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={rightLabel}
          onPress={rightAction.onPress}
          style={styles.sideHit}
        >
          <Feather name={rightIcon} size={24} color={StatisticsTheme.grey900} />
        </Pressable>
      ) : (
        <View style={styles.sideHit} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: StatisticsTheme.navbarPaddingV,
    gap: StatisticsTheme.navbarGap,
    minHeight: 48,
  },
  rowConstrained: {
    maxWidth: StatisticsTheme.contentMaxWidth,
  },
  sideHit: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '700',
    color: StatisticsTheme.grey900,
  },
});
