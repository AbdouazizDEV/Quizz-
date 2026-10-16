import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatisticsNavbar } from '@components/ui/statistics/StatisticsNavbar';
import { profileFonts } from '@components/ui/profile/ProfileFonts';
import { titleText } from '@constants/appText';
import { Colors } from '@constants/Colors';

export function PremiumScaffold({
  title,
  onBack,
  children,
  footer,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatisticsNavbar title={title} fonts={profileFonts} onBack={onBack} fullWidth />
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      {footer ? <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>{footer}</View> : null}
    </View>
  );
}

export function PremiumCta({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled]}>
      <LinearGradient colors={[Colors.premiumBgStart, Colors.premiumBgMid]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.cta}>
        <Text style={styles.ctaText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function PremiumCard({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  footer: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: Colors.background },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 8,
  },
  cta: { minHeight: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  ctaText: { color: '#FFFFFF', fontSize: 16, ...titleText },
  pressed: { opacity: 0.92 },
  disabled: { opacity: 0.6 },
});
