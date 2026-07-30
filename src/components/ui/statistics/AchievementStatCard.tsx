import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import type { AchievementStat } from '@app-types/statistics.types';
import { QuizzoLogoMark } from '@components/ui/brand/QuizzoLogoMark';
import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';
import { StatisticsTheme } from '@constants/statisticsTheme';

function StatIcon({ kind }: { kind: AchievementStat['icon'] }) {
  switch (kind) {
    case 'quizzo':
      return <QuizzoLogoMark size={26} />;
    case 'coin':
      return <Feather name="star" size={20} color="#D4A017" />;
    case 'flame':
      return <Feather name="zap" size={20} color="#F97316" />;
    case 'medal':
      return <Feather name="award" size={20} color="#FFB703" />;
    case 'target':
      return <Feather name="calendar" size={20} color="#1F2347" />;
    case 'clock':
      return <Feather name="clock" size={20} color="#DC2626" />;
    default:
      return <Feather name="help-circle" size={20} color={StatisticsTheme.grey700} />;
  }
}

interface AchievementStatCardProps {
  item: AchievementStat;
  fonts: ProfileFontFamilies;
  index?: number;
}

export function AchievementStatCard({ item, fonts, index = 0 }: AchievementStatCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(140 + index * 70).duration(420)}
      style={styles.card}
    >
      <View style={styles.iconWrap}>
        <StatIcon kind={item.icon} />
      </View>
      <Text style={[styles.value, fonts.bold && { fontFamily: fonts.bold }]} numberOfLines={1}>
        {item.valueFormatted}
      </Text>
      <Text style={[styles.label, fonts.medium && { fontFamily: fonts.medium }]} numberOfLines={1}>
        {item.label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    minHeight: 108,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 183, 3, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: StatisticsTheme.grey900,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: StatisticsTheme.grey700,
  },
});
