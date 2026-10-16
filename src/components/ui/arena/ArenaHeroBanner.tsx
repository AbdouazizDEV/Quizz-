import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@constants/Colors';
import { formatArenaDateTime } from '@utils/arenaDisplay';

interface ArenaHeroBannerProps {
  premiumExpiresAt: string;
  timezone: string;
}

export function ArenaHeroBanner({ premiumExpiresAt, timezone }: ArenaHeroBannerProps) {
  const premiumUntil = formatArenaDateTime(premiumExpiresAt, timezone);

  return (
    <LinearGradient
      colors={['#1A1A2E', '#2D2D52']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.badgeRow}>
        <Text style={styles.badge}>Arena 2026</Text>
      </View>
      <Text style={styles.title}>Compétition nationale</Text>
      <Text style={styles.lead}>
        L’accès au jeu reste gratuit. Le premium Arena s’active à l’inscription et court jusqu’au{' '}
        {premiumUntil} ({timezone}).
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  badgeRow: { flexDirection: 'row' },
  badge: {
    overflow: 'hidden',
    backgroundColor: 'rgba(245, 166, 35, 0.22)',
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  lead: { fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.88)', fontWeight: '600' },
});
