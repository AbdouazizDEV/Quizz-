import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { BadgeChip } from '@components/ui/badges/BadgeChip';
import { bodyText, titleText } from '@constants/appText';
import { Colors } from '@constants/Colors';
import type { PlayerBadgeView } from '@constants/westAfricanBadges';

interface PremiumStatusCardProps {
  title: string;
  body: string;
  featuredBadge?: PlayerBadgeView | null;
  arenaCtaLabel: string;
  onPressArena: () => void;
  secondaryCtaLabel?: string;
  onPressSecondary?: () => void;
  loading?: boolean;
}

export function PremiumStatusCard({
  title,
  body,
  arenaCtaLabel,
  onPressArena,
  secondaryCtaLabel,
  onPressSecondary,
  featuredBadge = null,
  loading = false,
}: PremiumStatusCardProps) {
  return (
    <View style={styles.shadowWrap}>
      <LinearGradient
        colors={[Colors.premiumSurface, '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBubble}>
            <Feather name="star" size={18} color={Colors.primary} />
          </View>
          <View style={styles.textCol}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {featuredBadge ? <BadgeChip badge={featuredBadge} /> : null}
            </View>
            <Text style={styles.body}>{body}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={onPressArena}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed, loading && styles.ctaDisabled]}
        >
          <LinearGradient
            colors={[Colors.premiumBgStart, Colors.premiumBgMid]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>{arenaCtaLabel}</Text>
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
        {secondaryCtaLabel && onPressSecondary ? (
          <Pressable accessibilityRole="button" onPress={onPressSecondary} style={styles.secondary}>
            <Text style={styles.secondaryText}>{secondaryCtaLabel}</Text>
          </Pressable>
        ) : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(232, 67, 26, 0.18)',
    padding: 16,
    gap: 14,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 166, 35, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 4, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { flexShrink: 1, fontSize: 16, ...titleText, color: Colors.textPrimary },
  body: { fontSize: 13, ...bodyText, color: Colors.textSecondary, lineHeight: 19 },
  cta: { borderRadius: 999, overflow: 'hidden', minHeight: 48 },
  ctaPressed: { opacity: 0.92 },
  ctaDisabled: { opacity: 0.65 },
  ctaGradient: {
    minHeight: 48,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { fontSize: 15, ...titleText, color: '#FFFFFF' },
  secondary: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 15, ...titleText, color: Colors.primary },
});
