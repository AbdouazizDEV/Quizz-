import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { QuizPlayTheme } from '@constants/quizPlayTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

export type AnswerVisualState = 'default' | 'correct' | 'wrong';

interface QuizAnswerOptionCardProps {
  label: string;
  backgroundColor: string;
  borderBottomColor: string;
  minHeight: number;
  state: AnswerVisualState;
  disabled: boolean;
  fonts: ProfileFontFamilies;
  onPress: () => void;
}

export function QuizAnswerOptionCard({
  label,
  backgroundColor,
  borderBottomColor,
  minHeight,
  state,
  disabled,
  fonts,
  onPress,
}: QuizAnswerOptionCardProps) {
  const bg =
    state === 'correct' ? '#12D18E' : state === 'wrong' ? QuizPlayTheme.error : backgroundColor;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          minHeight,
          backgroundColor: bg,
          borderBottomColor: state === 'default' ? borderBottomColor : 'transparent',
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {state !== 'default' ? (
        <View style={styles.badge}>
          <Feather name={state === 'correct' ? 'check' : 'x'} size={16} color="#FFF" />
        </View>
      ) : null}
      <Text style={[styles.label, fonts.bold && { fontFamily: fonts.bold }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 16,
    borderBottomWidth: 6,
    paddingVertical: 18,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.95,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    flexShrink: 1,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
