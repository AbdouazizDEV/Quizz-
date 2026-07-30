import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { GainsPageShell } from '@components/ui/gains/GainsPageShell';
import { GAINS_CASH_PRIZES, GAINS_PARTNER_OFFERS } from '@constants/gainsContent';

export default function GainsPrizesScreen() {
  return (
    <GainsPageShell title="Ce que je peux gagner">
      <Animated.View entering={FadeInDown.duration(420)}>
        <LinearGradient colors={['#1F2347', '#2E3570']} style={styles.hero}>
          <Feather name="award" size={22} color="#FFB703" />
          <Text style={styles.heroTitle}>Cash prizes</Text>
          <Text style={styles.heroBody}>
            Selon le classement officiel Quizz+ — semaine, mois et année.
          </Text>
        </LinearGradient>
      </Animated.View>

      <View style={styles.list}>
        {GAINS_CASH_PRIZES.map((prize, index) => (
          <Animated.View
            key={prize.id}
            entering={FadeInDown.delay(80 + index * 70).duration(400)}
            style={styles.prizeCard}
          >
            <View style={styles.prizeTop}>
              <Text style={styles.rankLabel}>{prize.rankLabel}</Text>
              <Text style={styles.amount}>{prize.amountLabel}</Text>
            </View>
            <Text style={styles.period}>{prize.periodLabel}</Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={FadeInDown.delay(280).duration(400)} style={styles.partners}>
        <View style={styles.partnersHead}>
          <Feather name="flag" size={16} color="#1F2347" />
          <Text style={styles.partnersTitle}>Offres partenaires</Text>
        </View>
        {GAINS_PARTNER_OFFERS.map((offer) => (
          <View key={offer} style={styles.offerRow}>
            <View style={styles.bullet} />
            <Text style={styles.offerText}>{offer}</Text>
          </View>
        ))}
      </Animated.View>

      <Text style={styles.footnote}>Selon le classement officiel Quizz+.</Text>
    </GainsPageShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 22,
    padding: 18,
    gap: 8,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  heroBody: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 18 },
  list: { gap: 10 },
  prizeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
    gap: 4,
  },
  prizeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rankLabel: { fontSize: 13, fontWeight: '700', color: '#757575' },
  amount: { fontSize: 18, fontWeight: '800', color: '#C9A000' },
  period: { fontSize: 14, fontWeight: '700', color: '#212121' },
  partners: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
    gap: 10,
  },
  partnersHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partnersTitle: { fontSize: 15, fontWeight: '800', color: '#212121' },
  offerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFB703',
  },
  offerText: { flex: 1, fontSize: 13, color: '#424242', fontWeight: '600' },
  footnote: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 4,
  },
});
