import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';

import { StatusBadge } from '@components/ui/common/StatusBadge';
import type { HomeActionTileDefinition } from '@constants/homeActionTiles';
import { HOME_ACTION_TILE_AMBER } from '@constants/homeActionTiles';
import { COLORS } from '@constants/Colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HomeActionTileCardProps {
  tile: HomeActionTileDefinition;
  index?: number;
  badgePulse?: boolean;
  onPress?: () => void;
}

export function HomeActionTileCard({ tile, index = 0, badgePulse = false, onPress }: HomeActionTileCardProps) {
  const scale = useSharedValue(1);
  const badgeOpacity = useSharedValue(1);

  useEffect(() => {
    if (badgePulse) {
      badgeOpacity.value = withRepeat(
        withSequence(withTiming(0.55, { duration: 700 }), withTiming(1, { duration: 700 })),
        -1,
        false,
      );
      return;
    }
    badgeOpacity.value = withTiming(1, { duration: 200 });
  }, [badgePulse, badgeOpacity]);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 100).duration(400)}
      accessibilityRole="button"
      accessibilityLabel={tile.title}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 100 });
      }}
      style={[styles.tile, animatedStyle]}
    >
      <View style={styles.iconWrap}>
        <Feather name={tile.icon} size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {tile.title}
      </Text>
      <Animated.View style={badgeAnimatedStyle}>
        <StatusBadge status={tile.badgeVariant} label={tile.badge} pulse={badgePulse} />
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    minHeight: 118,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: HOME_ACTION_TILE_AMBER,
    shadowColor: HOME_ACTION_TILE_AMBER,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textLight,
    fontSize: 15,
    textAlign: 'center',
  },
});
