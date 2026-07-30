import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface GainsRankHeroProps {
  rank: number | null;
  totalPoints: number;
  pointsToTop3: number | null;
}

function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export function GainsRankHero({ rank, totalPoints, pointsToTop3 }: GainsRankHeroProps) {
  const animatedPoints = useCountUp(totalPoints);
  const progress =
    pointsToTop3 == null || pointsToTop3 <= 0
      ? 1
      : Math.min(1, Math.max(0.12, 1 - pointsToTop3 / Math.max(totalPoints + pointsToTop3, 1)));

  return (
    <Animated.View entering={FadeInDown.duration(480)}>
      <LinearGradient colors={['#1F2347', '#2E3570']} style={styles.card}>
        <View style={styles.glow} />
        <View style={styles.topRow}>
          <View style={styles.iconBubble}>
            <Feather name="award" size={18} color="#1F2347" />
          </View>
          <Text style={styles.kicker}>Mon rang</Text>
        </View>

        <Text style={styles.rankLine}>
          Tu es <Text style={styles.rankAccent}>#{rank ?? '—'}</Text>
        </Text>
        <Text style={styles.pointsLine}>
          {new Intl.NumberFormat('fr-FR').format(animatedPoints)} pts
        </Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>

        <Text style={styles.hint}>
          {pointsToTop3 == null || pointsToTop3 <= 0
            ? 'Tu es dans le Top 3 — continue comme ça !'
            : `Encore ${new Intl.NumberFormat('fr-FR').format(pointsToTop3)} pts pour le Top 3`}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    gap: 8,
  },
  glow: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 183, 3, 0.22)',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFB703',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: { color: 'rgba(255,255,255,0.78)', fontWeight: '700', fontSize: 13 },
  rankLine: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 4 },
  rankAccent: { color: '#FFB703' },
  pointsLine: { color: '#F5D24A', fontSize: 18, fontWeight: '800' },
  progressTrack: {
    marginTop: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    borderRadius: 99,
    backgroundColor: '#FFB703',
    minWidth: 8,
  },
  hint: { marginTop: 6, color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 18 },
});
