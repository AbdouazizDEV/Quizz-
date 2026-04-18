import { MockStatisticsDataProvider } from './MockStatisticsDataProvider';

import type { IStatisticsDataProvider } from './IStatisticsDataProvider';

let instance: IStatisticsDataProvider = new MockStatisticsDataProvider();

export function getStatisticsDataProvider(): IStatisticsDataProvider {
  return instance;
}

export function setStatisticsDataProvider(provider: IStatisticsDataProvider): void {
  instance = provider;
}
