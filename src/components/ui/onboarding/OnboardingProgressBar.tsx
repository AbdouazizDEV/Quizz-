import { StyleSheet, View } from 'react-native';

interface OnboardingProgressBarProps {
  /** value between 0 and 1 */
  progress: number;
}

export function OnboardingProgressBar({ progress }: OnboardingProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: 200 * clamped }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 200,
    height: 12,
    borderRadius: 100,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 215, 0, 0.87)',
  },
});

