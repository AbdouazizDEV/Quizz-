import { StyleSheet, View } from 'react-native';

import { HomeActionTileCard } from '@components/ui/home/HomeActionTileCard';
import {
  HOME_ACTION_TILES,
  type HomeActionTileId,
} from '@constants/homeActionTiles';

interface HomeActionTilesProps {
  onTilePress?: (tileId: HomeActionTileId) => void;
  activePulse?: Partial<Record<HomeActionTileId, boolean>>;
}

export function HomeActionTiles({ onTilePress, activePulse }: HomeActionTilesProps) {
  return (
    <View style={styles.row}>
      {HOME_ACTION_TILES.map((tile, index) => (
        <HomeActionTileCard
          key={tile.id}
          tile={tile}
          index={index}
          badgePulse={activePulse?.[tile.id] ?? false}
          onPress={onTilePress ? () => onTilePress(tile.id) : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});
