import Animated, { FadeInDown } from 'react-native-reanimated';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CountdownTimer } from '@components/atoms/CountdownTimer';
import { COLORS } from '@constants/Colors';

interface DefisFeaturedChallengeCardProps {
  eyebrow: string;
  title: string;
  endsAt?: string | null;
  emptyMessage?: string;
  rewardHint?: string;
  ctaLabel?: string;
  index?: number;
  onPress?: () => void;
}

export function DefisFeaturedChallengeCard({
  eyebrow,
  title,
  endsAt,
  emptyMessage,
  rewardHint,
  ctaLabel = 'Voir le challenge →',
  index = 0,
  onPress,
}: DefisFeaturedChallengeCardProps) {
  const isEmpty = Boolean(emptyMessage);

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={isEmpty ? undefined : onPress}
        accessibilityRole="button"
        disabled={isEmpty}
      >
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{isEmpty ? emptyMessage : title}</Text>
        {!isEmpty && endsAt ? <CountdownTimer endsAt={endsAt} /> : null}
        {!isEmpty && rewardHint ? <Text style={styles.reward}>{rewardHint}</Text> : null}
        {!isEmpty && onPress ? (
          <Text style={styles.cta}>{ctaLabel}</Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    gap: 10,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  eyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  reward: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cta: {
    alignSelf: 'flex-end',
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.primaryDark,
    marginTop: 4,
  },
});
