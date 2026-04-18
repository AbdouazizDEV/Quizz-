import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { StatisticsTheme } from '@constants/statisticsTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface NetworkSearchNavBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  fonts: ProfileFontFamilies;
  autoFocus?: boolean;
}

export function NetworkSearchNavBar({
  value,
  onChangeText,
  onClose,
  fonts,
  autoFocus = true,
}: NetworkSearchNavBarProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fermer la recherche"
        onPress={onClose}
        style={styles.sideHit}
      >
        <Feather name="chevron-left" size={26} color={StatisticsTheme.grey900} />
      </Pressable>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Rechercher par @username"
        placeholderTextColor={StatisticsTheme.grey700}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        returnKeyType="search"
        underlineColorAndroid="transparent"
        style={[
          styles.input,
          fonts.medium && { fontFamily: fonts.medium },
        ]}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Effacer"
          onPress={() => onChangeText('')}
          style={styles.sideHit}
        >
          <Feather name="x" size={22} color={StatisticsTheme.grey900} />
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
  sideHit: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    fontSize: 16,
    lineHeight: 22,
    color: StatisticsTheme.grey900,
  },
});
