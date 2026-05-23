import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@constants/Colors';

interface DefisTabSwitcherProps<T extends string> {
  tabs: readonly { id: T; label: string }[];
  activeTab: T;
  onChange: (tab: T) => void;
}

export function DefisTabSwitcher<T extends string>({ tabs, activeTab, onChange }: DefisTabSwitcherProps<T>) {
  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onChange(tab.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: COLORS.separator,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  labelActive: {
    color: COLORS.textLight,
  },
});
