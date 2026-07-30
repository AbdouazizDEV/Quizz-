import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { AchievementStat } from '@app-types/statistics.types';
import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';
import { StatisticsTheme } from '@constants/statisticsTheme';

import { AchievementStatCard } from './AchievementStatCard';

function chunkPairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

interface AchievementsSectionProps {
  achievements: AchievementStat[];
  fonts: ProfileFontFamilies;
}

export function AchievementsSection({ achievements, fonts }: AchievementsSectionProps) {
  const rows = chunkPairs(achievements);

  return (
    <View style={styles.section}>
      <Animated.View entering={FadeInDown.delay(120).duration(420)}>
        <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>En un coup d’œil</Text>
        <Text style={[styles.subtitle, fonts.medium && { fontFamily: fonts.medium }]}>
          Tes indicateurs essentiels
        </Text>
      </Animated.View>
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((item, colIndex) => (
              <AchievementStatCard
                key={item.id}
                item={item}
                fonts={fonts}
                index={rowIndex * 2 + colIndex}
              />
            ))}
            {row.length === 1 ? <View style={styles.cellSpacer} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    gap: 14,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: StatisticsTheme.grey900,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: StatisticsTheme.grey700,
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  cellSpacer: {
    flex: 1,
  },
});
