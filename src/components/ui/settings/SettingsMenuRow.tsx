import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { SettingsScreenTheme } from '@constants/settingsScreenTheme';
import { ToggleSwitch } from '@components/ui/ToggleSwitch';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

interface SettingsMenuRowNavProps {
  variant: 'nav';
  label: string;
  icon: FeatherIconName;
  iconBackground: string;
  iconColor: string;
  onPress: () => void;
  fonts: ProfileFontFamilies;
  danger?: boolean;
  showChevron?: boolean;
}

interface SettingsMenuRowToggleProps {
  variant: 'toggle';
  label: string;
  icon: FeatherIconName;
  iconBackground: string;
  iconColor: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  fonts: ProfileFontFamilies;
}

export type SettingsMenuRowProps = SettingsMenuRowNavProps | SettingsMenuRowToggleProps;

export function SettingsMenuRow(props: SettingsMenuRowProps) {
  const { label, icon, iconBackground, iconColor, fonts } = props;

  const labelStyle = [
    styles.label,
    props.variant === 'nav' && props.danger && styles.labelDanger,
    fonts.medium && { fontFamily: fonts.medium },
  ];

  const iconBubble = (
    <View style={[styles.iconBubble, { backgroundColor: iconBackground }]}>
      <Feather name={icon} size={20} color={iconColor} />
    </View>
  );

  if (props.variant === 'toggle') {
    return (
      <View style={styles.row}>
        {iconBubble}
        <Text style={labelStyle} numberOfLines={1}>
          {label}
        </Text>
        <ToggleSwitch value={props.value} onValueChange={props.onValueChange} />
      </View>
    );
  }

  const showChevron = props.showChevron !== false;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={({ pressed }) => [styles.row, styles.rowPressable, pressed && { opacity: 0.85 }]}
    >
      {iconBubble}
      <Text style={labelStyle} numberOfLines={1}>
        {label}
      </Text>
      {showChevron ? <Feather name="chevron-right" size={20} color="#BDBDBD" /> : <View style={styles.chevronSpacer} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    minHeight: SettingsScreenTheme.rowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SettingsScreenTheme.rowIconGap,
  },
  rowPressable: {
    paddingVertical: 4,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: SettingsScreenTheme.grey900,
  },
  labelDanger: {
    color: '#E53935',
    fontWeight: '600',
  },
  chevronSpacer: {
    width: 20,
    height: 20,
  },
});
