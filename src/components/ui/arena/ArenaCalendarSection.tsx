import { StyleSheet, Text, View } from 'react-native';

import type { ArenaEdition } from '@app-types/arena.types';
import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { Colors } from '@constants/Colors';
import { buildArenaScheduleSummary, formatArenaPeriodLine } from '@utils/arenaDisplay';

interface ArenaCalendarSectionProps {
  edition: ArenaEdition;
}

export function ArenaCalendarSection({ edition }: ArenaCalendarSectionProps) {
  const scheduleLines = buildArenaScheduleSummary(edition);
  const periods = [...edition.periods].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <DefisSurfaceCard style={styles.card}>
      <Text style={styles.sectionTitle}>Calendrier & horaires</Text>
      <View style={styles.block}>
        <Text style={styles.blockLabel}>Horaires de jeu</Text>
        {scheduleLines.map((line) => (
          <Text key={line} style={styles.line}>
            {line}
          </Text>
        ))}
      </View>
      <View style={styles.block}>
        <Text style={styles.blockLabel}>Grandes étapes</Text>
        {periods.map((period) => (
          <Text key={period.id} style={styles.line}>
            {formatArenaPeriodLine(period, edition.timezone)}
          </Text>
        ))}
      </View>
    </DefisSurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  block: { gap: 8 },
  blockLabel: { fontSize: 14, fontWeight: '800', color: Colors.secondary },
  line: { fontSize: 13, lineHeight: 20, color: Colors.textSecondary, fontWeight: '600' },
});
