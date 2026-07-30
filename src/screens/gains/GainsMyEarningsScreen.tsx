import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import { GainsPageShell } from '@components/ui/gains/GainsPageShell';
import { GainsStreakBonuses } from '@components/ui/gains/GainsStreakBonuses';
import { GAINS_HISTORY_DEMO } from '@constants/gainsContent';
import { useAuthMe } from '@hooks/useAuthMe';

export default function GainsMyEarningsScreen() {
  const { data: me } = useAuthMe();
  const points = me?.profile?.total_score ?? 0;
  const streak = me?.profile?.streak_days ?? 0;

  return (
    <GainsPageShell title="Mes gains">
      <Animated.View entering={FadeInDown.duration(400)} style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{new Intl.NumberFormat('fr-FR').format(points)}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Récompenses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Offres</Text>
        </View>
      </Animated.View>

      <GainsStreakBonuses streakDays={streak} />

      <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.historyCard}>
        <View style={styles.historyHead}>
          <Feather name="bookmark" size={16} color="#1F2347" />
          <Text style={styles.historyTitle}>Historique</Text>
        </View>
        {GAINS_HISTORY_DEMO.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(160 + index * 60).duration(360)}
            style={styles.historyRow}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.historyItemTitle}>{item.title}</Text>
              <Text style={styles.historyItemSub}>
                {item.subtitle} · {item.whenLabel}
              </Text>
            </View>
            {typeof item.pointsDelta === 'number' ? (
              <Text
                style={[
                  styles.delta,
                  item.pointsDelta >= 0 ? styles.deltaPlus : styles.deltaMinus,
                ]}
              >
                {item.pointsDelta >= 0 ? '+' : ''}
                {item.pointsDelta} pts
              </Text>
            ) : null}
          </Animated.View>
        ))}
      </Animated.View>

      <Text style={styles.footnote}>Selon le classement officiel Quizz+.</Text>
    </GainsPageShell>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1F2347' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#757575' },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
    gap: 12,
  },
  historyHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyTitle: { fontSize: 16, fontWeight: '800', color: '#212121' },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEEEEE',
  },
  historyItemTitle: { fontSize: 14, fontWeight: '700', color: '#212121' },
  historyItemSub: { fontSize: 12, color: '#757575', marginTop: 2 },
  delta: { fontSize: 13, fontWeight: '800' },
  deltaPlus: { color: '#16A34A' },
  deltaMinus: { color: '#DC2626' },
  footnote: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});
