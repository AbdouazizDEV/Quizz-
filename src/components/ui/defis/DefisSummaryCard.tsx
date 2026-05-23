import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { SectionTitle } from '@components/ui/common/SectionTitle';
import type { DefisSummaryLine } from '@app-types/defisDashboard.types';
import { COLORS } from '@constants/Colors';

interface DefisSummaryCardProps {
  items: readonly DefisSummaryLine[];
  onItemPress?: (id: DefisSummaryLine['id']) => void;
}

export function DefisSummaryCard({ items, onItemPress }: DefisSummaryCardProps) {
  return (
    <View>
      <SectionTitle title="Résumé" />
      <DefisSurfaceCard>
        <View style={styles.list}>
          {items.map((item, index) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={onItemPress ? () => onItemPress(item.id) : undefined}
              style={({ pressed }) => [
                styles.row,
                index < items.length - 1 && styles.rowBorder,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.iconWrap}>
                <Feather name={item.icon} size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.label}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color={COLORS.textSecondary} />
            </Pressable>
          ))}
        </View>
      </DefisSurfaceCard>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});
