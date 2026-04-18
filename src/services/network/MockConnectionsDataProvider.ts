import type { ConnectionsScreenData } from '@app-types/network.types';

import type { IConnectionsDataProvider } from './IConnectionsDataProvider';

const AV = (seed: string) => `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed)}`;

export class MockConnectionsDataProvider implements IConnectionsDataProvider {
  async getConnections(_userId?: string): Promise<ConnectionsScreenData> {
    return {
      viewerDisplayName: 'Andrew Ainsley',
      followers: [
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
          id: 'f3',
          displayName: 'Davis Dorwart',
          handle: '@davis_dorwart',
          avatarUri: AV('davis'),
          relationshipIsActive: false,
        },
        {
          id: 'f4',
          displayName: 'Emery Korsgaard',
          handle: '@emery_k',
          avatarUri: AV('emery'),
          relationshipIsActive: false,
        },
        {
          id: 'f5',
          displayName: 'Randy Gouse',
          handle: '@randy_gouse',
          avatarUri: AV('randy'),
          relationshipIsActive: true,
        },
      ],
      following: [
        {
          id: 'g1',
          displayName: 'Maria Philips',
          handle: '@maria_philips',
          avatarUri: AV('maria'),
          relationshipIsActive: true,
        },
        {
          id: 'g2',
          displayName: 'James Schleifer',
          handle: '@james_s',
          avatarUri: AV('james'),
          relationshipIsActive: true,
        },
        {
          id: 'g3',
          displayName: 'Kurt Bates',
          handle: '@kurt_bates',
          avatarUri: AV('kurt'),
          relationshipIsActive: true,
        },
        {
          id: 'g4',
          displayName: 'Lincoln Donin',
          handle: '@lincoln_d',
          avatarUri: AV('lincoln'),
          relationshipIsActive: true,
        },
      ],
    };
  }
}
