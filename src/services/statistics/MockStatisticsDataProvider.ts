import type { StatisticsScreenData } from '@app-types/statistics.types';

import type { IStatisticsDataProvider } from './IStatisticsDataProvider';

const formatInt = (n: number) => new Intl.NumberFormat('en-US').format(n);

export class MockStatisticsDataProvider implements IStatisticsDataProvider {
  async getStatistics(_userId?: string): Promise<StatisticsScreenData> {
    return {
      weekly: {
        label: 'Your Point this Week',
        totalPointsFormatted: '875 Pt',
        yMax: 1000,
        points: [
          { dayIndex: 0, value: 120 },
          { dayIndex: 1, value: 340 },
          { dayIndex: 2, value: 280 },
          { dayIndex: 3, value: 520 },
          { dayIndex: 4, value: 610 },
          { dayIndex: 5, value: 720 },
          { dayIndex: 6, value: 875 },
        ],
      },
      achievements: [
        { id: 'a1', icon: 'quizzo', label: 'Quizzo', valueFormatted: '85' },
        {
          id: 'a2',
          icon: 'coin',
          label: 'Lifetime Point',
          valueFormatted: formatInt(245_679),
        },
        { id: 'a3', icon: 'flame', label: 'Quiz Passed', valueFormatted: '124' },
        { id: 'a4', icon: 'medal', label: 'Top 3 Positions', valueFormatted: '38' },
        {
          id: 'a5',
          icon: 'target',
          label: 'Challenge Pass...',
          valueFormatted: '269',
        },
        { id: 'a6', icon: 'clock', label: 'Fastest Record', valueFormatted: '72' },
      ],
    };
  }
}
