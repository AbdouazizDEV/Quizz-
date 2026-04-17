import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@constants/Spacing';

interface OnboardingContinueBarProps {
  label?: string;
  onPress?: () => void;
  fontFamily?: string;
}

export function OnboardingContinueBar({
  label = 'Continuer',
  onPress,
  fontFamily,
}: OnboardingContinueBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: 36 + insets.bottom }]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={[styles.text, fontFamily ? { fontFamily } : undefined]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 118,
    paddingTop: 24,
    paddingHorizontal: Spacing.screenHorizontal,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  button: {
    width: '100%',
    maxWidth: Spacing.onboardingMaxWidth,
    height: 58,
    borderRadius: 100,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.87)',
    borderBottomWidth: 5,
    borderBottomColor: '#543ACC',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: '#000000',
  },
  pressed: {
    opacity: 0.92,
  },
});
