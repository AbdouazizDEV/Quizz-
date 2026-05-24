import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@constants/Colors';
import { useNetworkStatus } from '@hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline, ready, pendingSyncCount } = useNetworkStatus();

  if (!ready) return null;

  if (isOnline && pendingSyncCount <= 0) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.title}>{isOnline ? 'Synchronisation' : 'Mode hors ligne'}</Text>
      <Text style={styles.body}>
        {isOnline
          ? `${pendingSyncCount} action(s) en cours de synchronisation…`
          : pendingSyncCount > 0
            ? `${pendingSyncCount} action(s) en attente — elles seront envoyées à la reconnexion.`
            : 'Vos données en cache restent disponibles. Les modifications seront envoyées à la reconnexion.'}
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
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.primaryDark,
  },
  body: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
