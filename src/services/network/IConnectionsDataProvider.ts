import type { ConnectionsScreenData } from '@app-types/network.types';
import type { ConnectionFilter } from '@app-types/network.types';

/** Contrat pour charger les utilisateurs du réseau (amis / suggestions). */
export interface IConnectionsDataProvider {
  getConnections(params: {
    filter: ConnectionFilter;
    query?: string;
    page: number;
    limit: number;
  }): Promise<ConnectionsScreenData>;
}
