import type { StatisticsScreenData } from '@app-types/statistics.types';

/** Contrat pour les données « Mes statistiques » (SOLID / DIP). */
export interface IStatisticsDataProvider {
  getStatistics(userId?: string): Promise<StatisticsScreenData>;
}
