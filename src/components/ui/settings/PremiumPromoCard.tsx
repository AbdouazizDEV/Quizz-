import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { Routes } from '@constants/Routes';
import { SettingsScreenTheme } from '@constants/settingsScreenTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

import { EtoileMark } from './EtoileMark';

interface PremiumPromoCardProps {
  fonts: ProfileFontFamilies;
}

export function PremiumPromoCard({ fonts }: PremiumPromoCardProps) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[...SettingsScreenTheme.premiumGradient]}
        start={{ x: 0.15, y: 1 }}
        end={{ x: 0.85, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.stars} pointerEvents="none">
          <View style={[styles.star, styles.star1]}>
            <EtoileMark size={28} />
          </View>
          <View style={[styles.star, styles.star2]}>
            <EtoileMark size={40} />
          </View>
          <View style={[styles.star, styles.star3]}>
            <EtoileMark size={22} />
          </View>
        </View>
        <Text style={[styles.headline, fonts.bold && { fontFamily: fonts.bold }]}>
          Play quizzes without ads and restrictions
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Passer Premium"
          onPress={() => router.push(Routes.PREMIUM_PLANS)}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}
        >
          <Text style={[styles.ctaText, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
            GO PREMIUM
          </Text>
        </Pressable>
      </LinearGradient>
      <View style={styles.purpleBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: SettingsScreenTheme.premiumRadius,
    overflow: 'hidden',
  },
  gradient: {
    minHeight: SettingsScreenTheme.premiumCardMinHeight - SettingsScreenTheme.premiumBorderBottom,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    justifyContent: 'center',
  },
  stars: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingRight: 8,
  },
  star: {
    position: 'absolute',
    opacity: 0.95,
  },
  star1: { top: 12, right: 24, transform: [{ rotate: '12deg' }] },
  star2: { top: 28, right: 8, transform: [{ rotate: '-8deg' }] },
  star3: { top: 56, right: 36, transform: [{ rotate: '20deg' }] },
  headline: {
    maxWidth: '78%',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#C9A000',
  },
  purpleBar: {
    height: SettingsScreenTheme.premiumBorderBottom,
    backgroundColor: SettingsScreenTheme.premiumBorder,
    width: '100%',
  },
});
