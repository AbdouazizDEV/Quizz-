import { useCallback, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatisticsNavbar } from '@components/ui/statistics/StatisticsNavbar';
import { Spacing } from '@constants/Spacing';
import { useAuthMe } from '@hooks/useAuthMe';
import { useAppError } from '@providers/AppErrorProvider';
import { getConnectionFollowService } from '@services/network/connectionFollowServiceInstance';
import { decodeFriendQrPayload } from '@utils/friendQrPayload';

import { FriendQrScannerPanel } from './FriendQrScannerPanel';

const fonts = { bold: undefined as string | undefined };

export default function FriendQrScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAppError } = useAppError();
  const { data: me } = useAuthMe();
  const [busy, setBusy] = useState(false);
  const handledRef = useRef(false);

  const myUserId = me?.user?.id?.trim() ?? '';

  const sendFriendRequest = useCallback(
    async (rawPayload: string) => {
      if (busy || handledRef.current || !rawPayload.trim()) return;

      const profile = decodeFriendQrPayload(rawPayload);
      if (!profile?.uid) {
        showAppError('QR code invalide ou expiré.', { title: 'Scanner un ami' });
        return;
      }

      if (myUserId && profile.uid === myUserId) {
        showAppError('Tu ne peux pas t’ajouter toi-même.', { title: 'Scanner un ami' });
        return;
      }

      handledRef.current = true;
      setBusy(true);
      try {
        await getConnectionFollowService().setFollowing(profile.uid, true);
        Alert.alert('Demande envoyée', `Ta demande d’ami a été envoyée à ${profile.n}.`, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } catch {
        handledRef.current = false;
        showAppError('Impossible d’envoyer la demande pour le moment.', {
          title: 'Scanner un ami',
          onRetry: () => void sendFriendRequest(rawPayload),
        });
      } finally {
        setBusy(false);
      }
    },
    [busy, myUserId, router, showAppError],
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', '#F8F8F8']} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
        <StatisticsNavbar title="Scanner un ami" fonts={fonts} onBack={() => router.back()} fullWidth />
        <FriendQrScannerPanel busy={busy} onScan={(payload) => void sendFriendRequest(payload)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontal,
    gap: 16,
  },
});
