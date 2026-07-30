import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import { GAINS_STREAK_TIERS } from '@constants/gainsContent';

interface GainsStreakBonusesProps {
  streakDays: number;
}

export function GainsStreakBonuses({ streakDays }: GainsStreakBonusesProps) {
  return (
    <Animated.View entering={FadeInDown.delay(100).duration(420)} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBubble}>
          <Feather name="activity" size={16} color="#F97316" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Bonus de série</Text>
          <Text style={styles.sub}>
            Série actuelle : <Text style={styles.subStrong}>{streakDays} jour{streakDays > 1 ? 's' : ''}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.track}>
        {GAINS_STREAK_TIERS.map((tier, index) => {
          const unlocked = streakDays >= tier.days;
          const next =
            streakDays < tier.days &&
            (index === 0 || streakDays >= GAINS_STREAK_TIERS[index - 1]!.days);
          return (
            <View key={tier.id} style={styles.tier}>
              <View
                style={[
                  styles.dot,
                  unlocked && styles.dotOn,
                  next && styles.dotNext,
                ]}
              />
              <Text style={[styles.tierDays, unlocked && styles.tierDaysOn]}>{tier.label}</Text>
              <Text style={[styles.tierBonus, unlocked && styles.tierBonusOn]}>{tier.hint}</Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
    gap: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(249,115,22,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '800', color: '#212121' },
  sub: { fontSize: 12, color: '#616161', marginTop: 2 },
  subStrong: { fontWeight: '800', color: '#F97316' },
  track: { flexDirection: 'row', gap: 8 },
  tier: { flex: 1, alignItems: 'center', gap: 6 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E8E8E8',
    borderWidth: 2,
    borderColor: '#D0D0D0',
  },
  dotOn: { backgroundColor: '#FFB703', borderColor: '#E0A100' },
  dotNext: { borderColor: '#F97316', backgroundColor: '#FFE4D4' },
  tierDays: { fontSize: 11, fontWeight: '700', color: '#9E9E9E', textAlign: 'center' },
  tierDaysOn: { color: '#212121' },
  tierBonus: { fontSize: 10, color: '#9E9E9E', textAlign: 'center', fontWeight: '600' },
  tierBonusOn: { color: '#C9A000' },
});
