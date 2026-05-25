import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface AboutFeatureCardProps {
  title: string;
  body: string;
  icon: 'layers' | 'zap' | 'users';
  fonts: ProfileFontFamilies;
}

const ICON_STYLE = {
  layers: { bg: '#FFF3E0', color: '#F57C00' },
  zap: { bg: '#FFF8E1', color: '#FFB703' },
  users: { bg: '#E8F5E9', color: '#43A047' },
} as const;

export function AboutFeatureCard({ title, body, icon, fonts }: AboutFeatureCardProps) {
  const visual = ICON_STYLE[icon];

  return (
    <View style={styles.card}>
      <View style={[styles.iconBubble, { backgroundColor: visual.bg }]}>
        <Feather name={icon} size={20} color={visual.color} />
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.title, fonts.semiBold && { fontFamily: fonts.semiBold }]}>{title}</Text>
        <Text style={[styles.body, fonts.medium && { fontFamily: fonts.medium }]}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: '700', color: '#212121' },
  body: { fontSize: 14, lineHeight: 20, color: '#616161' },
});
