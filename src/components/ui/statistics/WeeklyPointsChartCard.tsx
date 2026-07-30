import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { WeeklySeriesSummary } from '@app-types/statistics.types';
import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';
import { StatisticsTheme } from '@constants/statisticsTheme';

import { WeeklyLineChartSvg } from './WeeklyLineChartSvg';

const X_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;
const CHART_HEIGHT = 168;

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

  const yTicks = useMemo(() => {
    const max = Math.max(weekly.yMax, 1);
    return [max, Math.round(max / 2), 0];
  }, [weekly.yMax]);

  const onChartLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setPlotW(w);
  };

  return (
    <Animated.View entering={FadeInDown.delay(80).duration(480)} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[styles.headerLabel, fonts.medium && { fontFamily: fonts.medium }]}>
            {weekly.label}
          </Text>
          <Text style={[styles.headerValue, fonts.bold && { fontFamily: fonts.bold }]}>
            {weekly.totalPointsFormatted}
          </Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          {yTicks.map((label) => (
            <Text key={label} style={[styles.yTick, fonts.medium && { fontFamily: fonts.medium }]}>
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
                <Text style={[styles.xTick, fonts.medium && { fontFamily: fonts.medium }]}>{d}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: StatisticsTheme.contentMaxWidth,
    borderRadius: 22,
    padding: 18,
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#1F2347',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    gap: 2,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: StatisticsTheme.grey700,
  },
  headerValue: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: StatisticsTheme.grey900,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 6,
  },
  yAxis: {
    width: 32,
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
    marginTop: 8,
  },
  xCell: {
    flex: 1,
    alignItems: 'center',
  },
  xTick: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: StatisticsTheme.grey700,
    textAlign: 'center',
  },
});
