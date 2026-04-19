import { fetchAuthMe } from '@services/auth/fetchAuthMe';
import { useAuthStore } from '@stores/authStore';

import type { IStatisticsDataProvider } from './IStatisticsDataProvider';
import { mapAuthMeToStatisticsScreenData } from './mapAuthMeToStatisticsScreenData';
import { MockStatisticsDataProvider } from './MockStatisticsDataProvider';

export class ApiStatisticsDataProvider implements IStatisticsDataProvider {
  private readonly fallback = new MockStatisticsDataProvider();

  async getStatistics(_userId?: string) {
    const token = useAuthStore.getState().token?.trim();
    if (!token) {
      return this.fallback.getStatistics(_userId);
    }
    try {
      const me = await fetchAuthMe();
      if (!me?.user) {
        return this.fallback.getStatistics(_userId);
      }
      return mapAuthMeToStatisticsScreenData(me);
    } catch {
      return this.fallback.getStatistics(_userId);
    }
  }
}
