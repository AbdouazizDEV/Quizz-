import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';

interface GainsExpressCtaProps {
  onPress: () => void;
}

export function GainsExpressCta({ onPress }: GainsExpressCtaProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withSequence(
      withTiming(1.03, { duration: 700 }),
      withTiming(1, { duration: 700 }),
      withTiming(1.03, { duration: 700 }),
      withTiming(1, { duration: 700 }),
    );
  }, [pulse]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(60).duration(420)} style={animStyle}>
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.92 }}>
        <LinearGradient colors={['#FFB703', '#F5A623']} style={styles.card}>
          <View style={styles.iconWrap}>
            <Feather name="zap" size={22} color="#1F2347" />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.title}>Quiz Express</Text>
            <Text style={styles.sub}>Joue vite, gagne des points maintenant</Text>
          </View>
          <Feather name="arrow-right" size={20} color="#1F2347" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(31,35,71,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 17, fontWeight: '800', color: '#1F2347' },
  sub: { fontSize: 12, color: 'rgba(31,35,71,0.75)', fontWeight: '600' },
});
