import { StyleSheet, Text, View } from 'react-native';

import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { SectionTitle } from '@components/ui/common/SectionTitle';
import { COLORS } from '@constants/Colors';

interface DefisQuickStatsSectionProps {
  defiPlayed: number;
  bestRank: number | null;
  duelsWon: number;
  duelsTotal: number;
}

export function DefisQuickStatsSection({
  defiPlayed,
  bestRank,
  duelsWon,
  duelsTotal,
}: DefisQuickStatsSectionProps) {
  return (
    <View>
      <SectionTitle title="Mes statistiques rapides" />
      <DefisSurfaceCard>
        <View style={styles.row}>
          <StatItem label="Défis joués ce mois" value={String(defiPlayed)} />
          <StatItem label="Meilleur classement" value={bestRank ? `#${bestRank}` : '—'} />
          <StatItem label="Duels gagnés" value={`${duelsWon}/${duelsTotal}`} />
        </View>
      </DefisSurfaceCard>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: COLORS.primary,
  },
  label: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    textAlign: 'center',
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
});
