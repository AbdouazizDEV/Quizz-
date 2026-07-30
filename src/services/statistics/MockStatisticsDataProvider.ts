import type { StatisticsScreenData } from '@app-types/statistics.types';

import type { IStatisticsDataProvider } from './IStatisticsDataProvider';

const formatInt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

export class MockStatisticsDataProvider implements IStatisticsDataProvider {
  async getStatistics(_userId?: string): Promise<StatisticsScreenData> {
    return {
      weekly: {
        label: 'Cette semaine',
        totalPointsFormatted: '875 pts',
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
      performanceRatio: 0.72,
      performanceLabel: 'Score',
      achievements: [
        { id: 'a1', icon: 'quizzo', label: 'Quiz joués', valueFormatted: '85' },
        { id: 'a2', icon: 'coin', label: 'Points', valueFormatted: formatInt(245_679) },
        { id: 'a3', icon: 'flame', label: 'Série', valueFormatted: '12 j' },
        { id: 'a4', icon: 'medal', label: 'Niveau', valueFormatted: 'Z2' },
        { id: 'a5', icon: 'target', label: 'Jours actifs', valueFormatted: '48' },
      ],
    };
  }
}
