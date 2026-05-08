import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { QuizPlayTheme } from '@constants/quizPlayTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

export type AnswerVisualState = 'default' | 'correct' | 'wrong';

export type QuizAnswerCardVariant = 'bar' | 'square';

interface QuizAnswerOptionCardProps {
  label: string;
  backgroundColor: string;
  borderBottomColor: string;
  /** Hauteur min (mode barre) ; ignoré en mode carré. */
  minHeight: number;
  /** `bar` = pleine largeur ; `square` = carte carrée (grille). */
  variant?: QuizAnswerCardVariant;
  /** Côté du carré (mode `square` uniquement). */
  squareSize?: number;
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
  variant = 'bar',
  squareSize = 0,
  state,
  disabled,
  fonts,
  onPress,
}: QuizAnswerOptionCardProps) {
  const bg =
    state === 'correct' ? '#12D18E' : state === 'wrong' ? QuizPlayTheme.error : backgroundColor;

  const isSquare = variant === 'square' && squareSize > 0;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isSquare ? styles.cardSquare : styles.cardBar,
        isSquare
          ? {
              width: squareSize,
              height: squareSize,
              backgroundColor: bg,
              borderBottomColor: state === 'default' ? borderBottomColor : 'transparent',
            }
          : {
              minHeight,
              backgroundColor: bg,
              borderBottomColor: state === 'default' ? borderBottomColor : 'transparent',
            },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {state !== 'default' ? (
        <View style={[styles.badge, isSquare && styles.badgeSquare]}>
          <Feather name={state === 'correct' ? 'check' : 'x'} size={isSquare ? 14 : 16} color="#FFF" />
        </View>
      ) : null}
      <Text
        style={[
          styles.label,
          isSquare && styles.labelSquare,
          fonts.bold && { fontFamily: fonts.bold },
        ]}
        numberOfLines={isSquare ? 4 : undefined}
        adjustsFontSizeToFit={isSquare}
        minimumFontScale={isSquare ? 0.72 : 1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderBottomWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBar: {
    width: '100%',
    alignSelf: 'stretch',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  cardSquare: {
    paddingVertical: 10,
    paddingHorizontal: 8,
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
  labelSquare: {
    fontSize: 16,
    lineHeight: 20,
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
  badgeSquare: {
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
  },
});
