import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { ProfileCircularPerformance } from '@components/ui/profile/ProfileCircularPerformance';
import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface PerformanceRingCardProps {
  ratio: number;
  label: string;
  fonts: ProfileFontFamilies;
  hint?: string;
}

export function PerformanceRingCard({
  ratio,
  label,
  fonts,
  hint = 'Basé sur tes quiz, série et score',
}: PerformanceRingCardProps) {
  return (
    <Animated.View entering={FadeInDown.duration(480)} style={styles.wrap}>
      <LinearGradient colors={['#1F2347', '#2A2F66']} style={styles.card}>
        <View style={styles.glow} />
        <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>Performance</Text>
        <Text style={[styles.subtitle, fonts.medium && { fontFamily: fonts.medium }]}>{hint}</Text>
        <View style={styles.ringWrap}>
          <View style={styles.ringPlate}>
            <ProfileCircularPerformance
              ratio={ratio}
              label={label}
              size={156}
              fonts={fonts}
              animated
              animationDelayMs={220}
            />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  card: {
    width: '100%',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    overflow: 'hidden',
    gap: 4,
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 183, 3, 0.18)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 10,
  },
  ringWrap: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  ringPlate: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
