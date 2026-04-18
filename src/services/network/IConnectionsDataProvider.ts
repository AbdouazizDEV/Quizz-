import type { ConnectionsScreenData } from '@app-types/network.types';

/** Contrat pour charger followers / following (SOLID / DIP). */
export interface IConnectionsDataProvider {
  getConnections(userId?: string): Promise<ConnectionsScreenData>;
}
