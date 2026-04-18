import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ProfileStatItem } from '@app-types/profile.types';
import { ProfileTheme } from '@constants/profileTheme';

import type { ProfileFontFamilies } from './ProfileFonts';

interface ProfileStatsGridProps {
  stats: ProfileStatItem[];
  fonts: ProfileFontFamilies;
}

function RowSeparator() {
  return <View style={styles.hLine} />;
}

function VerticalSeparator() {
  return <View style={styles.vLine} />;
}

function StatCell({
  item,
  fonts,
}: {
  item: ProfileStatItem;
  fonts: ProfileFontFamilies;
}) {
  return (
    <View style={styles.cell}>
      <Text style={[styles.value, fonts.bold && { fontFamily: fonts.bold }]}>{item.valueLabel}</Text>
      <Text style={[styles.caption, fonts.medium && { fontFamily: fonts.medium }]}>{item.caption}</Text>
    </View>
  );
}

export function ProfileStatsGrid({ stats, fonts }: ProfileStatsGridProps) {
  const row1 = stats.slice(0, 3);
  const row2 = stats.slice(3, 6);

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        {row1.map((item, i) => (
          <Fragment key={item.id}>
            <StatCell item={item} fonts={fonts} />
            {i < row1.length - 1 ? <VerticalSeparator /> : null}
          </Fragment>
        ))}
      </View>
      <RowSeparator />
      <View style={styles.row}>
        {row2.map((item, i) => (
          <Fragment key={item.id}>
            <StatCell item={item} fonts={fonts} />
            {i < row2.length - 1 ? <VerticalSeparator /> : null}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 58,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  value: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: ProfileTheme.grey900,
  },
  caption: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'center',
    color: ProfileTheme.grey800,
  },
  hLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: ProfileTheme.grey200,
    width: '100%',
  },
  vLine: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: ProfileTheme.grey200,
    alignSelf: 'stretch',
    marginVertical: 4,
  },
});
