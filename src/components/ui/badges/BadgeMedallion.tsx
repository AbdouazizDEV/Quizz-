import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { BadgeGlyph } from '@components/ui/badges/BadgeGlyph';
import {
  BADGE_FINISH,
  isWestAfricanBadgeCode,
  type BadgeFinish,
  type PlayerBadgeView,
} from '@constants/westAfricanBadges';

type Size = 'sm' | 'md' | 'lg';

const DISC: Record<Size, number> = { sm: 28, md: 88, lg: 168 };

const FINISH: Record<BadgeFinish, { colors: [string, string, string]; glyph: string }> = {
  terracotta: { colors: ['#FFB199', '#E8431A', '#9A220E'], glyph: '#FFD166' },
  indigo: { colors: ['#4A4E8A', '#1A1A2E', '#0D0D18'], glyph: '#FFD166' },
  gold: { colors: ['#FFF1B0', '#FFD166', '#C07A00'], glyph: '#1A1A2E' },
};

interface BadgeMedallionProps {
  badge: PlayerBadgeView;
  size?: Size;
  celebrate?: boolean;
  onPress?: () => void;
}

export function BadgeMedallion({
  badge,
  size = 'md',
  celebrate = false,
  onPress,
}: BadgeMedallionProps) {
  const code = isWestAfricanBadgeCode(badge.code) ? badge.code : 'teranga';
  const finish = FINISH[BADGE_FINISH[code]];
  const disc = DISC[size];
  const spin = useSharedValue(0);
  const bounce = useSharedValue(1);
  const shine = useSharedValue(0);

  useEffect(() => {
    if (!badge.earned) {
      spin.value = 0;
      shine.value = 0;
      return;
    }
    if (size !== 'sm') {
      spin.value = withRepeat(withTiming(1, { duration: 7500, easing: Easing.inOut(Easing.sin) }), -1, true);
      shine.value = withRepeat(withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.quad) }), -1, false);
    }
    if (celebrate) {
      bounce.value = withSequence(withTiming(1.14, { duration: 220 }), withTiming(1, { duration: 280 }));
    }
  }, [badge.earned, bounce, celebrate, shine, size, spin]);

  const sceneStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 520 },
      { rotateY: `${interpolate(spin.value, [0, 1], [-18, 18])}deg` },
      { rotateX: `${interpolate(spin.value, [0, 1], [10, 6])}deg` },
      { scale: bounce.value },
    ],
  }));

  const shineStyle = useAnimatedStyle(() => ({
    opacity: badge.earned ? interpolate(shine.value, [0, 0.4, 0.7, 1], [0, 0.85, 0, 0]) : 0,
    transform: [{ translateX: interpolate(shine.value, [0, 1], [-disc * 0.18, disc * 0.18]) }],
  }));

  const tap = () => {
    bounce.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withTiming(1.1, { duration: 140 }),
      withTiming(1, { duration: 180 }),
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${badge.name}, ${badge.motif}. ${badge.earned ? 'Obtenu' : 'À gagner'}`}
      onPress={tap}
      style={styles.hit}
    >
      <Animated.View style={[styles.scene, { width: disc, height: disc }, sceneStyle]}>
        <LinearGradient
          colors={finish.colors}
          start={{ x: 0.28, y: 0.18 }}
          end={{ x: 0.92, y: 1 }}
          style={[styles.disc, { width: disc, height: disc }, !badge.earned && styles.locked]}
        >
          <View style={styles.rim} />
          <BadgeGlyph code={code} size={Math.round(disc * 0.62)} color={finish.glyph} />
          <Animated.View pointerEvents="none" style={[styles.shine, shineStyle]} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { alignItems: 'center', justifyContent: 'center' },
  scene: { alignItems: 'center', justifyContent: 'center' },
  disc: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#1A1A2E',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  rim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255, 209, 102, 0.45)',
  },
  shine: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  locked: { opacity: 0.62 },
});
