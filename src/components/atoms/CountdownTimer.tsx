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

function formatLabel(time: TimeRemaining): string {
  if (time.expired) return 'Expiré';
  if (time.days > 0) return `Se termine dans ${time.days}j ${time.hours}h`;
  if (time.hours > 0) return `Se termine dans ${time.hours}h ${time.minutes}m`;
  if (time.minutes > 0) {
    return `Se termine dans ${time.minutes}m ${String(time.seconds).padStart(2, '0')}s`;
  }
  return `Se termine dans ${time.seconds}s`;
}

export function CountdownTimer({ endsAt, style }: CountdownTimerProps) {
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
        time.isUrgent && !time.expired && styles.urgent,
        time.expired && styles.expired,
        style,
        animatedStyle,
      ]}
    >
      {time.expired ? '⏱' : '📅'} {formatLabel(time)}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  urgent: {
    color: COLORS.error,
  },
  expired: {
    color: COLORS.error,
    fontFamily: 'Nunito_800ExtraBold',
  },
});
