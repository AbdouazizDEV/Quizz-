import { ProfileTheme } from '@constants/profileTheme';

export const SettingsScreenTheme = {
  ...ProfileTheme,
  premiumBorder: '#543ACC',
  premiumGradient: ['#FFB703', '#FFC933'] as const,
  pagePaddingTop: 16,
  pagePaddingBottom: 48,
  outerGap: 28,
  bodyGap: 24,
  rowHeight: 56,
  rowIconGap: 20,
  premiumCardMinHeight: 170,
  premiumRadius: 20,
  premiumBorderBottom: 6,
} as const;
