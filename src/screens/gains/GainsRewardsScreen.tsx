import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import { GainsPageShell } from '@components/ui/gains/GainsPageShell';
import {
  GAINS_REWARD_CATALOG,
  GAINS_REWARD_CATEGORIES,
} from '@constants/gainsContent';
import { useAuthMe } from '@hooks/useAuthMe';

export default function GainsRewardsScreen() {
  const { data: me } = useAuthMe();
  const points = me?.profile?.total_score ?? 0;

  return (
    <GainsPageShell title="Récompenses">
      <Animated.View entering={FadeInDown.duration(400)} style={styles.balance}>
        <Text style={styles.balanceLabel}>Tes points disponibles</Text>
        <Text style={styles.balanceValue}>
          {new Intl.NumberFormat('fr-FR').format(points)} pts
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(400)} style={styles.chips}>
        {GAINS_REWARD_CATEGORIES.map((cat) => (
          <View key={cat} style={styles.chip}>
            <Text style={styles.chipText}>{cat}</Text>
          </View>
        ))}
      </Animated.View>

      <View style={styles.list}>
        {GAINS_REWARD_CATALOG.map((item, index) => {
          const canAfford = points >= item.costPoints && item.available;
          return (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(100 + index * 60).duration(400)}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <View style={styles.iconBubble}>
                  <Feather name="shopping-bag" size={16} color="#1F2347" />
                </View>
                <View style={styles.textCol}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.meta}>{item.category}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.cost}>
                  {new Intl.NumberFormat('fr-FR').format(item.costPoints)} pts
                </Text>
                <Pressable
                  disabled={!canAfford}
                  onPress={() =>
                    Alert.alert(
                      'Échange bientôt disponible',
                      'La validation des récompenses arrive dans une prochaine version.',
                    )
                  }
                  style={[styles.cta, !canAfford && styles.ctaDisabled]}
                >
                  <Text style={[styles.ctaText, !canAfford && styles.ctaTextDisabled]}>
                    {!item.available ? 'Indisponible' : canAfford ? 'Échanger' : 'Pas assez'}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </GainsPageShell>
  );
}

const styles = StyleSheet.create({
  balance: {
    backgroundColor: '#1F2347',
    borderRadius: 20,
    padding: 18,
    gap: 4,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: 13 },
  balanceValue: { color: '#FFB703', fontSize: 28, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: 'rgba(255,183,3,0.18)',
  },
  chipText: { fontSize: 12, fontWeight: '700', color: '#1F2347' },
  list: { gap: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 14,
    gap: 12,
  },
  cardTop: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(34,197,94,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '800', color: '#212121' },
  meta: { fontSize: 12, color: '#757575', fontWeight: '600' },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cost: { fontSize: 14, fontWeight: '800', color: '#C9A000' },
  cta: {
    backgroundColor: '#FFB703',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  ctaDisabled: { backgroundColor: '#EEEEEE' },
  ctaText: { fontSize: 12, fontWeight: '800', color: '#1F2347' },
  ctaTextDisabled: { color: '#9E9E9E' },
});
