import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface FriendQrScannerPanelProps {
  busy: boolean;
  onScan: (payload: string) => void;
}

export function FriendQrScannerPanel({ busy, onScan }: FriendQrScannerPanelProps) {
  const [manualLink, setManualLink] = useState('');

  return (
    <View style={styles.webFallback}>
      <Feather name="camera-off" size={42} color="#6B7280" />
      <Text style={styles.webTitle}>Scan indisponible sur le web</Text>
      <Text style={styles.webBody}>
        Colle le lien partagé par ton ami ci-dessous pour lui envoyer une demande d’ami.
      </Text>
      <TextInput
        value={manualLink}
        onChangeText={setManualLink}
        placeholder="quizzplus://friend?d=..."
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
  );
}

const styles = StyleSheet.create({
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  webTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  webBody: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    width: '100%',
    marginTop: 8,
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
    marginTop: 8,
    backgroundColor: '#2A2D5E',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  manualBtnDisabled: { opacity: 0.55 },
  manualBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
