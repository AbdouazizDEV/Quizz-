import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { GainsExpressCta } from '@components/ui/gains/GainsExpressCta';
import { GainsPageShell } from '@components/ui/gains/GainsPageShell';
import { GAINS_HOW_STEPS } from '@constants/gainsContent';
import { Routes } from '@constants/Routes';

export default function GainsHowToWinScreen() {
  const router = useRouter();

  return (
    <GainsPageShell title="Comment gagner">
      <Animated.View entering={FadeInDown.duration(420)} style={styles.hero}>
        <Text style={styles.heroTitle}>Joue stratégiquement</Text>
        <Text style={styles.heroBody}>
          Combine Quiz Express, défis et série pour maximiser tes points et viser le cash.
        </Text>
      </Animated.View>

      <GainsExpressCta onPress={() => router.push(Routes.CATEGORIES)} />

      <View style={styles.list}>
        {GAINS_HOW_STEPS.map((step, index) => (
          <Animated.View
            key={step.id}
            entering={FadeInDown.delay(80 + index * 70).duration(400)}
            style={styles.card}
          >
            <View style={styles.iconBubble}>
              <Feather name={step.icon} size={18} color="#1F2347" />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.cardTitle}>
                {index + 1}. {step.title}
              </Text>
              <Text style={styles.cardBody}>{step.body}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </GainsPageShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
    gap: 6,
  },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#212121' },
  heroBody: { fontSize: 14, lineHeight: 20, color: '#616161' },
  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 14,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,183,3,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#212121' },
  cardBody: { fontSize: 13, lineHeight: 18, color: '#616161' },
});
