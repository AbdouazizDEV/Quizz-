import { StyleSheet, Text, View } from 'react-native';

import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import type { DefisParticipationItem } from '@app-types/defis.types';

interface DefisParticipationsSectionProps {
  items: readonly DefisParticipationItem[];
}

export function DefisParticipationsSection({ items }: DefisParticipationsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mes participations</Text>
      <DefisSurfaceCard style={styles.card}>
        {items.map((item, index) => (
          <View key={item.id} style={[styles.row, index < items.length - 1 && styles.rowBorder]}>
            <View style={styles.textBlock}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
        ))}
      </DefisSurfaceCard>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#212121',
    fontSize: 20,
    fontWeight: '800',
  },
  card: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECECEC',
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#212121',
  },
  subtitle: {
    fontSize: 13,
    color: '#757575',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: '#FFF7D6',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B4E00',
  },
});
