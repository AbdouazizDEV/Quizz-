import { StyleSheet, Text, View } from 'react-native';

import type { AchievementStat } from '@app-types/statistics.types';
import { StatisticsTheme } from '@constants/statisticsTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

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
      <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>
        Your Achievements
      </Text>
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((item) => (
              <View key={item.id} style={styles.cell}>
                <AchievementStatCard item={item} fonts={fonts} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    gap: 16,
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    color: StatisticsTheme.grey900,
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
});
