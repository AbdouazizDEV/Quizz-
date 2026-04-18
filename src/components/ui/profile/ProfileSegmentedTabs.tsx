import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProfileTabId } from '@app-types/profile.types';
import { ProfileTheme } from '@constants/profileTheme';

import type { ProfileFontFamilies } from './ProfileFonts';

const TABS: { id: ProfileTabId; label: string }[] = [
  { id: 'quizzo', label: 'Quizzo' },
  { id: 'collections', label: 'Collections' },
  { id: 'about', label: 'About' },
];

interface ProfileSegmentedTabsProps {
  active: ProfileTabId;
  onChange: (id: ProfileTabId) => void;
  fonts: ProfileFontFamilies;
}

export function ProfileSegmentedTabs({ active, onChange, fonts }: ProfileSegmentedTabsProps) {
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
    maxWidth: ProfileTheme.contentMaxWidth,
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    backgroundColor: ProfileTheme.primary500,
  },
  pillInactive: {
    backgroundColor: ProfileTheme.white,
    borderWidth: 1.5,
    borderColor: '#FFB703',
  },
  pillText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  pillTextActive: {
    color: ProfileTheme.white,
  },
  pillTextInactive: {
    color: '#C9A000',
  },
});
