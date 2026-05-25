import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SettingsScreenTheme } from '@constants/settingsScreenTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface SettingsSectionCardProps {
  title?: string;
  children: ReactNode;
  fonts: ProfileFontFamilies;
}

export function SettingsSectionCard({ title, children, fonts }: SettingsSectionCardProps) {
  return (
    <View style={styles.card}>
      {title ? (
        <Text style={[styles.title, fonts.semiBold && { fontFamily: fonts.semiBold }]}>{title}</Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: SettingsScreenTheme.grey900,
    marginBottom: 2,
  },
});
