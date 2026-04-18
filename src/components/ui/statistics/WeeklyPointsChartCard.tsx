import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import type { WeeklySeriesSummary } from '@app-types/statistics.types';
import { StatisticsTheme } from '@constants/statisticsTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

import { WeeklyLineChartSvg } from './WeeklyLineChartSvg';

const Y_LABELS = [1000, 800, 600, 400, 200, 0] as const;
const X_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const CHART_HEIGHT = 200;

interface WeeklyPointsChartCardProps {
  weekly: WeeklySeriesSummary;
  fonts: ProfileFontFamilies;
}

export function WeeklyPointsChartCard({ weekly, fonts }: WeeklyPointsChartCardProps) {
  const [plotW, setPlotW] = useState(260);
  const values = weekly.points
    .slice()
    .sort((a, b) => a.dayIndex - b.dayIndex)
    .map((p) => p.value);

  const onChartLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setPlotW(w);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerLabel, fonts.medium && { fontFamily: fonts.medium }]}>
          {weekly.label}
        </Text>
        <Text style={[styles.headerValue, fonts.bold && { fontFamily: fonts.bold }]}>
          {weekly.totalPointsFormatted}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          {Y_LABELS.map((label) => (
            <Text
              key={label}
              style={[styles.yTick, fonts.medium && { fontFamily: fonts.medium }]}
            >
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.plotCol}>
          <View style={styles.plotInner} onLayout={onChartLayout}>
            <WeeklyLineChartSvg
              width={plotW}
              height={CHART_HEIGHT}
              values={values}
              yMax={weekly.yMax}
            />
          </View>
          <View style={styles.xAxis}>
            {X_LABELS.map((d) => (
              <View key={d} style={styles.xCell}>
                <Text style={[styles.xTick, fonts.medium && { fontFamily: fonts.medium }]}>
                  {d}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: StatisticsTheme.contentMaxWidth,
    borderWidth: 1,
    borderColor: StatisticsTheme.cardBorder,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    backgroundColor: StatisticsTheme.white,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: StatisticsTheme.grey800,
    flex: 1,
    marginRight: 8,
  },
  headerValue: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: StatisticsTheme.grey900,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: StatisticsTheme.grey200,
    width: '100%',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 4,
  },
  yAxis: {
    width: 36,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
    paddingRight: 2,
  },
  yTick: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
    color: StatisticsTheme.grey700,
    textAlign: 'right',
  },
  plotCol: {
    flex: 1,
    minWidth: 0,
  },
  plotInner: {
    width: '100%',
    height: CHART_HEIGHT,
  },
  xAxis: {
    flexDirection: 'row',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  xCell: {
    flex: 1,
    alignItems: 'center',
  },
  xTick: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
    color: StatisticsTheme.grey700,
    textAlign: 'center',
  },
});
