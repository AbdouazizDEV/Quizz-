import type { ConnectionsScreenData } from '@app-types/network.types';
import type { ConnectionFilter } from '@app-types/network.types';

import type { IConnectionsDataProvider } from './IConnectionsDataProvider';

const AV = (seed: string) => `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed)}`;

export class MockConnectionsDataProvider implements IConnectionsDataProvider {
  async getConnections(params: {
    filter: ConnectionFilter;
    query?: string;
    page: number;
    limit: number;
  }): Promise<ConnectionsScreenData> {
    const all = [
      {
        id: 'f1',
        displayName: 'Augustina Midgett',
        handle: '@augustina_midgett',
        avatarUri: AV('augustina'),
        relationshipIsActive: false,
      },
      {
        id: 'f2',
        displayName: 'Craig Loveseat',
        handle: '@craig_loveseat',
        avatarUri: AV('craig'),
        relationshipIsActive: true,
      },
      {
        id: 'g1',
        displayName: 'Maria Philips',
        handle: '@maria_philips',
        avatarUri: AV('maria'),
        relationshipIsActive: params.filter === 'friends',
      },
    ];
    const q = params.query?.trim().toLowerCase() ?? '';
    const filtered = q
      ? all.filter((u) => u.displayName.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q))
      : all;
    const from = (params.page - 1) * params.limit;
    const items = filtered.slice(from, from + params.limit);
    return {
      viewerDisplayName: 'Andrew Ainsley',
      items,
      page: params.page,
      limit: params.limit,
      total: filtered.length,
      hasMore: from + params.limit < filtered.length,
    };
  }
}
