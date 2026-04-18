import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { SettingsScreenTheme } from '@constants/settingsScreenTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface SettingsLeadingHeaderProps {
  title: string;
  onBack: () => void;
  fonts: ProfileFontFamilies;
}

/** Barre retour + titre alignés à gauche (maquette Settings). */
export function SettingsLeadingHeader({ title, onBack, fonts }: SettingsLeadingHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        onPress={onBack}
        style={styles.backHit}
      >
        <Feather name="chevron-left" size={26} color={SettingsScreenTheme.grey900} />
      </Pressable>
      <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SettingsScreenTheme.navbarGap,
    paddingVertical: SettingsScreenTheme.navbarPaddingV,
    minHeight: 48,
  },
  backHit: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '700',
    color: SettingsScreenTheme.grey900,
    flexShrink: 1,
  },
});
