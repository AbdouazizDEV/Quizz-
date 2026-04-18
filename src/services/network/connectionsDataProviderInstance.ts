import { MockConnectionsDataProvider } from './MockConnectionsDataProvider';

import type { IConnectionsDataProvider } from './IConnectionsDataProvider';

let instance: IConnectionsDataProvider = new MockConnectionsDataProvider();

export function getConnectionsDataProvider(): IConnectionsDataProvider {
  return instance;
}

export function setConnectionsDataProvider(provider: IConnectionsDataProvider): void {
  instance = provider;
}
