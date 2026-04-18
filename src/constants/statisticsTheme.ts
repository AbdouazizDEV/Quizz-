import { ProfileTheme } from '@constants/profileTheme';

export const StatisticsTheme = {
  ...ProfileTheme,
  cardBorder: '#E0E0E0',
  chartLine: '#FFB703',
  chartFillStart: 'rgba(167, 139, 250, 0.45)',
  chartFillEnd: 'rgba(167, 139, 250, 0.05)',
  globalPaddingBottom: 48,
  bodyGap: 16,
} as const;
