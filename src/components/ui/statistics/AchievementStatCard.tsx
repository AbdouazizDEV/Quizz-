import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { AchievementStat } from '@app-types/statistics.types';
import { QuizzoLogoMark } from '@components/ui/brand/QuizzoLogoMark';
import { StatisticsTheme } from '@constants/statisticsTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

function StatIcon({ kind }: { kind: AchievementStat['icon'] }) {
  switch (kind) {
    case 'quizzo':
      return <QuizzoLogoMark size={28} />;
    case 'coin':
      return <Feather name="dollar-sign" size={22} color="#D4A017" />;
    case 'flame':
      return <Feather name="zap" size={22} color="#F97316" />;
    case 'medal':
      return <Feather name="award" size={22} color="#FFB703" />;
    case 'target':
      return <Feather name="target" size={22} color="#E11D48" />;
    case 'clock':
      return <Feather name="clock" size={22} color="#DC2626" />;
    default:
      return <Feather name="help-circle" size={22} color={StatisticsTheme.grey700} />;
  }
}

interface AchievementStatCardProps {
  item: AchievementStat;
  fonts: ProfileFontFamilies;
}

export function AchievementStatCard({ item, fonts }: AchievementStatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <StatIcon kind={item.icon} />
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.value, fonts.bold && { fontFamily: fonts.bold }]} numberOfLines={1}>
          {item.valueFormatted}
        </Text>
        <Text style={[styles.label, fonts.medium && { fontFamily: fonts.medium }]} numberOfLines={2}>
          {item.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: StatisticsTheme.cardBorder,
    borderRadius: 12,
    backgroundColor: StatisticsTheme.white,
    minHeight: 72,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  value: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: StatisticsTheme.grey900,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: StatisticsTheme.grey700,
  },
});
