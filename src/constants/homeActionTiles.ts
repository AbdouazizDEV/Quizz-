import type { Feather } from '@expo/vector-icons';

import { COLORS } from '@constants/Colors';

export type HomeActionTileId = 'challenge' | 'tournament' | 'duel';

export interface HomeActionTileDefinition {
  id: HomeActionTileId;
  title: string;
  badge: string;
  badgeVariant: 'en_cours' | 'rapide';
  icon: keyof typeof Feather.glyphMap;
}

export const HOME_ACTION_TILES: readonly HomeActionTileDefinition[] = [
  {
    id: 'challenge',
    title: 'Challenge',
    badge: 'Hebdo',
    badgeVariant: 'en_cours',
    icon: 'flag',
  },
  {
    id: 'tournament',
    title: 'Tournoi',
    badge: 'Mensuel',
    badgeVariant: 'en_cours',
    icon: 'award',
  },
  {
    id: 'duel',
    title: 'Duel',
    badge: 'Rapide',
    badgeVariant: 'rapide',
    icon: 'zap',
  },
] as const;

export const HOME_ACTION_TILE_AMBER = COLORS.primary;
