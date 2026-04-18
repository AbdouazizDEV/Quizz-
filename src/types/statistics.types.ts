/** Point série hebdomadaire (indice 0 = lundi). */
export interface WeeklyPoint {
  dayIndex: number;
  /** Valeur affichée sur l’axe Y (ex. 0–1000). */
  value: number;
}

export interface WeeklySeriesSummary {
  label: string;
  totalPointsFormatted: string;
  points: WeeklyPoint[];
  yMax: number;
}

export type AchievementIconKind =
  | 'quizzo'
  | 'coin'
  | 'flame'
  | 'medal'
  | 'target'
  | 'clock';

export interface AchievementStat {
  id: string;
  icon: AchievementIconKind;
  label: string;
  valueFormatted: string;
}

export interface StatisticsScreenData {
  weekly: WeeklySeriesSummary;
  achievements: AchievementStat[];
}
