import { ProfileTheme } from '@constants/profileTheme';

export const StatisticsTheme = {
  ...ProfileTheme,
  cardBorder: '#F0F0F0',
  chartLine: '#FFB703',
  chartFillStart: 'rgba(255, 183, 3, 0.35)',
  chartFillEnd: 'rgba(255, 183, 3, 0.02)',
  globalPaddingBottom: 48,
  bodyGap: 16,
} as const;
