import type { ComponentProps } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { HelpContactEntry } from '@constants/helpCenterContent';
import { SettingsScreenTheme } from '@constants/settingsScreenTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

type FeatherName = ComponentProps<typeof Feather>['name'];

interface HelpContactRowProps {
  entry: HelpContactEntry;
  fonts: ProfileFontFamilies;
}

export function HelpContactRow({ entry, fonts }: HelpContactRowProps) {
  const onPress = () => {
    void Linking.openURL(entry.target);
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.88 }]}
      accessibilityRole="link"
    >
      <View style={[styles.iconBubble, { backgroundColor: entry.iconBackground }]}>
        <Feather name={entry.icon as FeatherName} size={20} color={entry.iconColor} />
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.label, fonts.semiBold && { fontFamily: fonts.semiBold }]}>{entry.label}</Text>
        <Text style={[styles.sub, fonts.medium && { fontFamily: fonts.medium }]}>{entry.subtitle}</Text>
      </View>
      <Feather name="external-link" size={18} color="#BDBDBD" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 2 },
  label: { fontSize: 16, fontWeight: '700', color: SettingsScreenTheme.grey900 },
  sub: { fontSize: 14, color: '#757575' },
});
