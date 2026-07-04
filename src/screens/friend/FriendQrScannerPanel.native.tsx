import { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface FriendQrScannerPanelProps {
  busy: boolean;
  onScan: (payload: string) => void;
}

export function FriendQrScannerPanel({ busy, onScan }: FriendQrScannerPanelProps) {
  const [permission, requestPermission] = useCameraPermissions();

  const onBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      onScan(data);
    },
    [onScan],
  );

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#F5D24A" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          Autorise l’accès à la caméra pour scanner le QR d’un ami.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => void requestPermission()} style={styles.manualBtn}>
          <Text style={styles.manualBtnText}>Autoriser la caméra</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.cameraWrap}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={busy ? undefined : onBarcodeScanned}
      />
      <View style={styles.scanFrame} pointerEvents="none" />
      <Text style={styles.scanHint}>Place le QR code de ton ami dans le cadre</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  permissionText: {
    textAlign: 'center',
    color: '#374151',
    fontSize: 16,
    lineHeight: 22,
  },
  cameraWrap: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  camera: { flex: 1 },
  scanFrame: {
    position: 'absolute',
    top: '22%',
    left: '12%',
    right: '12%',
    bottom: '28%',
    borderWidth: 2,
    borderColor: '#F5D24A',
    borderRadius: 16,
  },
  scanHint: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  manualBtn: {
    marginTop: 8,
    backgroundColor: '#2A2D5E',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  manualBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
