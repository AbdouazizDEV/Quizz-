import { ApiConnectionsDataProvider } from './ApiConnectionsDataProvider';

import type { IConnectionsDataProvider } from './IConnectionsDataProvider';

let instance: IConnectionsDataProvider = new ApiConnectionsDataProvider();

export function getConnectionsDataProvider(): IConnectionsDataProvider {
  return instance;
}

export function setConnectionsDataProvider(provider: IConnectionsDataProvider): void {
  instance = provider;
}
