import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ConnectionFilter } from '@app-types/network.types';
import { NetworkTheme } from '@constants/networkTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

const TABS: { id: ConnectionFilter; label: string }[] = [
  { id: 'followers', label: 'Followers' },
  { id: 'following', label: 'Following' },
];

interface NetworkFilterTabsProps {
  active: ConnectionFilter;
  onChange: (id: ConnectionFilter) => void;
  fonts: ProfileFontFamilies;
}

export function NetworkFilterTabs({ active, onChange, fonts }: NetworkFilterTabsProps) {
  return (
    <View style={styles.row}>
      {TABS.map((tab) => {
        const isOn = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isOn }}
            onPress={() => onChange(tab.id)}
            style={[styles.pill, isOn ? styles.pillActive : styles.pillInactive]}
          >
            <Text
              style={[
                styles.pillText,
                isOn ? styles.pillTextActive : styles.pillTextInactive,
                fonts.semiBold && { fontFamily: fonts.semiBold },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 38,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
  },
  pillActive: {
    backgroundColor: NetworkTheme.primary500,
  },
  pillInactive: {
    backgroundColor: NetworkTheme.listSurface,
    borderWidth: 1.5,
    borderColor: NetworkTheme.accentYellow,
  },
  pillText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  pillTextActive: {
    color: NetworkTheme.white,
  },
  pillTextInactive: {
    color: NetworkTheme.accentYellowText,
  },
});
