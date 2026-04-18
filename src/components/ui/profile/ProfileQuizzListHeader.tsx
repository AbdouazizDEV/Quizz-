import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ProfileTheme } from '@constants/profileTheme';

import type { ProfileFontFamilies } from './ProfileFonts';

interface ProfileQuizzListHeaderProps {
  title: string;
  sortLabel: string;
  fonts: ProfileFontFamilies;
  onPressSort?: () => void;
}

export function ProfileQuizzListHeader({
  title,
  sortLabel,
  fonts,
  onPressSort,
}: ProfileQuizzListHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={[styles.left, fonts.bold && { fontFamily: fonts.bold }]}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Trier les quiz"
        onPress={onPressSort}
        style={styles.sort}
      >
        <Text style={[styles.sortText, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
          {sortLabel}
        </Text>
        <View style={styles.sortArrows}>
          <Feather name="chevron-up" size={12} color="#C9A000" />
          <Feather name="chevron-down" size={12} color="#C9A000" style={styles.chevronDown} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  left: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    color: ProfileTheme.grey900,
  },
  sort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortArrows: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronDown: {
    marginTop: -6,
  },
  sortText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#C9A000',
  },
});
