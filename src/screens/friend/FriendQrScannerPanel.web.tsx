import { useId, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useFriendQrCameraScanner } from '@hooks/useFriendQrCameraScanner';

interface FriendQrScannerPanelProps {
  busy: boolean;
  onScan: (payload: string) => void;
}

export function FriendQrScannerPanel({ busy, onScan }: FriendQrScannerPanelProps) {
  const readerId = useId().replace(/:/g, '');
  const containerId = `friend-qr-reader-${readerId}`;
  const [manualLink, setManualLink] = useState('');

  const { status, errorMessage } = useFriendQrCameraScanner({
    containerId,
    enabled: !busy,
    onDetected: onScan,
  });

  const cameraReady = status === 'ready';
  const cameraStarting = status === 'starting';

  return (
    <View style={styles.root}>
      <View style={styles.cameraWrap}>
        <div
          id={containerId}
          style={{
            width: '100%',
            minHeight: 280,
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: '#111827',
          }}
        />
        {cameraStarting ? (
          <View style={styles.cameraOverlay}>
            <Text style={styles.cameraOverlayText}>Activation de la caméra…</Text>
          </View>
        ) : null}
        {cameraReady ? <View style={styles.scanFrame} pointerEvents="none" /> : null}
        {cameraReady ? (
          <Text style={styles.scanHint}>
            {busy ? 'QR détecté, envoi en cours…' : 'Place le QR code Quizz+ de ton ami dans le cadre'}
          </Text>
        ) : null}
        {errorMessage ? (
          <View style={styles.cameraFallback}>
            <Feather name="camera-off" size={36} color="#FFFFFF" />
            <Text style={styles.cameraError}>{errorMessage}</Text>
            <Text style={styles.cameraFallbackHint}>
              Colle le lien partagé par ton ami ci-dessous.
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.manualBlock}>
        <Text style={styles.manualTitle}>Lien ou payload</Text>
        <TextInput
          value={manualLink}
          onChangeText={setManualLink}
          placeholder="https://quizzp.com/friend?d=..."
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => onScan(manualLink.trim())}
          disabled={busy || !manualLink.trim()}
          style={({ pressed }) => [
            styles.manualBtn,
            (pressed || busy || !manualLink.trim()) && styles.manualBtnDisabled,
          ]}
        >
          <Text style={styles.manualBtnText}>{busy ? 'Envoi…' : 'Envoyer la demande'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 20,
  },
  cameraWrap: {
    minHeight: 280,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111827',
    position: 'relative',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.88)',
  },
  cameraOverlayText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  scanFrame: {
    position: 'absolute',
    top: '18%',
    left: '10%',
    right: '10%',
    bottom: '24%',
    borderWidth: 2,
    borderColor: '#F5D24A',
    borderRadius: 16,
  },
  scanHint: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cameraFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
  },
  cameraError: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  cameraFallbackHint: {
    color: '#D1D5DB',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  manualBlock: {
    gap: 10,
  },
  manualTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  manualBtn: {
    marginTop: 4,
    backgroundColor: '#2A2D5E',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  manualBtnDisabled: { opacity: 0.55 },
  manualBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
