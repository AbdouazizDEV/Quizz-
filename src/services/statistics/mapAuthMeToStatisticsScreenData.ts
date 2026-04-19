import type { StatisticsScreenData, WeeklyPoint } from '@app-types/statistics.types';
import type { AuthMeResponse } from '@services/auth/fetchAuthMe';

const formatInt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

function buildWeeklyPoints(profile: AuthMeResponse['profile']): WeeklyPoint[] {
  const total = profile?.total_score ?? 0;
  const streak = profile?.streak_days ?? 0;
  const base = Math.max(8, Math.round(total / 10));
  return Array.from({ length: 7 }, (_, i) => ({
    dayIndex: i,
    value: Math.round(base * (0.35 + (i / 6) * 0.55) + (i === 6 ? streak * 8 : 0)),
  }));
}

export function mapAuthMeToStatisticsScreenData(me: AuthMeResponse): StatisticsScreenData {
  const profile = me.profile;
  const totalScore = profile?.total_score ?? 0;
  const quizzesDone = profile?.quizzes_completed ?? 0;
  const streak = profile?.streak_days ?? 0;
  const daysActive = profile?.days_active ?? 0;

  const points = buildWeeklyPoints(profile);
  const maxVal = Math.max(...points.map((p) => p.value), 100);
  const weekSum = points.reduce((a, p) => a + p.value, 0);

  return {
    weekly: {
      label: 'Points cette semaine',
      totalPointsFormatted: `${formatInt(weekSum)} Pt`,
      yMax: Math.max(100, Math.ceil(maxVal / 100) * 100),
      points,
    },
    achievements: [
      { id: 'a1', icon: 'quizzo', label: 'Quizzo', valueFormatted: String(quizzesDone) },
      {
        id: 'a2',
        icon: 'coin',
        label: 'Points totaux',
        valueFormatted: formatInt(totalScore),
      },
      { id: 'a3', icon: 'flame', label: 'Série (jours)', valueFormatted: String(streak) },
      { id: 'a4', icon: 'medal', label: 'Niveau', valueFormatted: profile?.level_code ?? 'Z0' },
      {
        id: 'a5',
        icon: 'target',
        label: 'Jours actifs',
        valueFormatted: String(daysActive),
      },
      {
        id: 'a6',
        icon: 'clock',
        label: 'Premium',
        valueFormatted: profile?.is_premium ? 'Oui' : 'Non',
      },
    ],
  };
}
