import { StyleSheet, Text, View } from 'react-native';

import { levelBadgeFor } from '@constants/levelBadges';

export function LevelBadge({ code, compact = false }: { code?: string; compact?: boolean }) {
  const badge = levelBadgeFor(code);
  return (
    <View
      accessibilityLabel={`Niveau ${badge.step}`}
      style={[styles.badge, compact && styles.compact, { backgroundColor: badge.tint }]}
    >
      <Text style={[styles.mark, compact && styles.markCompact]}>{badge.mark}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 40,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(26, 26, 46, 0.35)',
  },
  mark: { color: '#1A1A2E', fontSize: 13, fontWeight: '900', letterSpacing: 0.4 },
  compact: { minWidth: 32, height: 24, paddingHorizontal: 6 },
  markCompact: { fontSize: 11 },
});
