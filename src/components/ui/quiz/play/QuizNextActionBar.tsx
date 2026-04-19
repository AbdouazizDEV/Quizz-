import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuizPlayTheme } from '@constants/quizPlayTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface QuizNextActionBarProps {
  label: string;
  visible: boolean;
  fonts: ProfileFontFamilies;
  onPress: () => void;
}

export function QuizNextActionBar({ label, visible, fonts, onPress }: QuizNextActionBarProps) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(24, insets.bottom + 12) }]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      >
        <Text style={[styles.btnText, fonts.bold && { fontFamily: fonts.bold }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: QuizPlayTheme.white,
    borderTopWidth: 1,
    borderTopColor: QuizPlayTheme.grey100,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 24,
    alignItems: 'center',
    zIndex: 15,
  },
  btn: {
    width: '100%',
    maxWidth: QuizPlayTheme.contentMaxWidth,
    height: 58,
    borderRadius: 100,
    backgroundColor: QuizPlayTheme.primaryButton,
    borderBottomWidth: 5,
    borderBottomColor: QuizPlayTheme.primaryButtonBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  btnText: {
    color: '#212121',
    fontSize: 17,
    fontWeight: '800',
  },
});
