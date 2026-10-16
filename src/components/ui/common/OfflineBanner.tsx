import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@constants/Colors';
import { useNetworkStatus } from '@hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline, ready, pendingSyncCount } = useNetworkStatus();

  if (!ready) return null;

  if (isOnline && pendingSyncCount <= 0) return null;

  const title = isOnline ? 'Synchronisation en cours' : 'Mode hors ligne';
  const body = isOnline
    ? pendingSyncCount === 1
      ? '1 action est en cours d’envoi vers le serveur…'
      : `${pendingSyncCount} actions sont en cours d’envoi vers le serveur…`
    : pendingSyncCount > 0
      ? pendingSyncCount === 1
        ? '1 action en attente — elle sera envoyée à la reconnexion.'
        : `${pendingSyncCount} actions en attente — elles seront envoyées à la reconnexion.`
      : 'Vos données en cache restent disponibles. Les modifications seront envoyées à la reconnexion.';

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.title} numberOfLines={1} allowFontScaling={false}>
        {title}
      </Text>
      <Text style={styles.body} numberOfLines={2} allowFontScaling={false}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  body: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
