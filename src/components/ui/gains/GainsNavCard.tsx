import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

interface GainsNavCardProps {
  icon: ComponentProps<typeof Feather>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
  delayMs?: number;
  accent?: string;
}

export function GainsNavCard({
  icon,
  title,
  subtitle,
  onPress,
  delayMs = 0,
  accent = '#FFB703',
}: GainsNavCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delayMs).duration(420)} style={styles.wrap}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
      >
        <View style={[styles.iconBubble, { backgroundColor: `${accent}33` }]}>
          <Feather name={icon} size={18} color="#1F2347" />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color="#BDBDBD" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '800', color: '#212121' },
  subtitle: { fontSize: 12, lineHeight: 16, color: '#757575', fontWeight: '500' },
});
