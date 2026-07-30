import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { ProfileTheme } from '@constants/profileTheme';

import type { ProfileFontFamilies } from './ProfileFonts';

interface ProfileCircularPerformanceProps {
  /** 0–1 */
  ratio: number;
  label?: string;
  size?: number;
  fonts: ProfileFontFamilies;
  /** Anime le remplissage à l’apparition (défaut: true). */
  animated?: boolean;
  /** Délai avant démarrage de l’animation (ms). */
  animationDelayMs?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Anneau de performance (donut) — réutilisable profil + stats. */
export function ProfileCircularPerformance({
  ratio,
  label = 'Perf.',
  size = 120,
  fonts,
  animated = true,
  animationDelayMs = 120,
}: ProfileCircularPerformanceProps) {
  const stroke = Math.max(8, Math.round(size * 0.1));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, ratio));

  const [progress, setProgress] = useState(animated ? 0 : clamped);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scale = useSharedValue(animated ? 0.82 : 1);

  useEffect(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    if (timeoutRef.current != null) clearTimeout(timeoutRef.current);

    if (!animated) {
      setProgress(clamped);
      scale.value = 1;
      return;
    }

    setProgress(0);
    scale.value = 0.82;
    scale.value = withDelay(
      animationDelayMs,
      withSpring(1, { damping: 14, stiffness: 160 }),
    );

    timeoutRef.current = setTimeout(() => {
      const duration = 1150;
      const startTs = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - startTs) / duration);
        setProgress(clamped * easeOutCubic(t));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setProgress(clamped);
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    }, animationDelayMs);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
    };
  }, [animated, animationDelayMs, clamped, scale]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const displayPct = Math.round(progress * 100);
  const offset = c * (1 - progress);
  const centerFontSize = Math.max(16, Math.round(size * 0.18));
  const labelFontSize = Math.max(10, Math.round(size * 0.09));
  const cx = size / 2;
  const cy = size / 2;

  return (
    <Animated.View
      entering={animated ? FadeIn.duration(420) : undefined}
      style={[styles.wrap, { width: size, height: size }, scaleStyle]}
    >
      <View style={styles.svgRotate}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} stroke="#ECECEC" strokeWidth={stroke} fill="none" />
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="#FFB703"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>
      </View>
      <View style={styles.center} pointerEvents="none">
        <Text
          style={[
            styles.percent,
            { fontSize: centerFontSize },
            fonts.bold && { fontFamily: fonts.bold },
          ]}
        >
          {displayPct}%
        </Text>
        <Text
          style={[
            styles.label,
            { fontSize: labelFontSize },
            fonts.medium && { fontFamily: fonts.medium },
          ]}
        >
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  svgRotate: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: { fontWeight: '800', color: ProfileTheme.grey900 },
  label: { color: ProfileTheme.grey700, marginTop: 2 },
});
