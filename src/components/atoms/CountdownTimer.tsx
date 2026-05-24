import { useEffect, useState } from 'react';
import { StyleSheet, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { COLORS } from '@constants/Colors';

interface CountdownTimerProps {
  endsAt: string;
  style?: TextStyle;
  /** Texte clair sur fond sombre (ex. bannière tournoi). */
  light?: boolean;
  /** Affiche « Se termine dans … » ; désactivé si un libellé est déjà au-dessus. */
  showPrefix?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isUrgent: boolean;
  expired: boolean;
}

function getTimeRemaining(endsAt: string): TimeRemaining {
  const now = Date.now();
  const end = new Date(endsAt).getTime();
  const diff = Math.max(0, end - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const underOneHour = diff > 0 && diff < 60 * 60 * 1000;

  return {
    days,
    hours,
    minutes,
    seconds,
    isUrgent: underOneHour,
    expired: diff === 0,
  };
}

function formatTimeCore(time: TimeRemaining): string {
  if (time.expired) return 'Expiré';
  if (time.days > 0) return `${time.days}j ${time.hours}h`;
  if (time.hours > 0) return `${time.hours}h ${time.minutes}m`;
  if (time.minutes > 0) {
    return `${time.minutes}m ${String(time.seconds).padStart(2, '0')}s`;
  }
  return `${time.seconds}s`;
}

function formatLabel(time: TimeRemaining, showPrefix: boolean): string {
  const core = formatTimeCore(time);
  if (time.expired || !showPrefix) return core;
  return `Se termine dans ${core}`;
}

export function CountdownTimer({ endsAt, style, light = false, showPrefix = true }: CountdownTimerProps) {
  const [time, setTime] = useState(() => getTimeRemaining(endsAt));
  const opacity = useSharedValue(1);

  useEffect(() => {
    const tick = () => setTime(getTimeRemaining(endsAt));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  useEffect(() => {
    if (time.isUrgent && !time.expired) {
      opacity.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1,
        false,
      );
      return;
    }
    opacity.value = withTiming(1, { duration: 200 });
  }, [time.isUrgent, time.expired, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        styles.text,
        light && styles.light,
        time.isUrgent && !time.expired && (light ? styles.urgentLight : styles.urgent),
        time.expired && styles.expired,
        style,
        animatedStyle,
      ]}
    >
      {!showPrefix && !time.expired ? '⏱ ' : time.expired ? '⏱ ' : showPrefix ? '📅 ' : ''}
      {formatLabel(time, showPrefix)}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  light: {
    color: '#FFD54A',
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
  },
  urgent: {
    color: COLORS.error,
  },
  urgentLight: {
    color: '#FF8A65',
  },
  expired: {
    color: COLORS.error,
    fontFamily: 'Nunito_800ExtraBold',
  },
});
