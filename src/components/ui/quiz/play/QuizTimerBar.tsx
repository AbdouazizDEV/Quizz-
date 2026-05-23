import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface QuizTimerBarProps {
  progress: number;
  timeLeft: number;
  duration: number;
  fontFamily?: string;
}

export function QuizTimerBar({ progress, timeLeft, duration, fontFamily }: QuizTimerBarProps) {
  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: 800,
      easing: Easing.linear,
    });
  }, [animatedProgress, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
    backgroundColor: interpolateColor(
      animatedProgress.value,
      [0, 0.3, 0.6, 1],
      ['#E8431A', '#F5A623', '#F5A623', '#4CAF50'],
    ),
  }));

  const isUrgent = progress <= 0.3;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>
      <Text
        style={[
          styles.timeText,
          fontFamily ? { fontFamily } : undefined,
          isUrgent && styles.urgentText,
        ]}
      >
        {timeLeft}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#212121',
    minWidth: 32,
    textAlign: 'right',
  },
  urgentText: {
    color: '#E8431A',
  },
});
