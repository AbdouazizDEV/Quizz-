import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { FriendRequestItem } from '@services/network/friendRequestsApi';

interface HomeFriendRequestsSheetProps {
  visible: boolean;
  loading: boolean;
  requests: FriendRequestItem[];
  onClose: () => void;
  onAccept: (notificationId: string) => void;
  onReject: (notificationId: string) => void;
}

export function HomeFriendRequestsSheet({
  visible,
  loading,
  requests,
  onClose,
  onAccept,
  onReject,
}: HomeFriendRequestsSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={styles.title}>Demandes d'amis</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {loading ? (
              <Text style={styles.infoText}>Chargement...</Text>
            ) : requests.length === 0 ? (
              <Text style={styles.infoText}>Aucune demande en attente.</Text>
            ) : (
              requests.map((req) => (
                <View key={req.notificationId} style={styles.row}>
                  {req.requesterAvatarUrl ? (
                    <Image source={{ uri: req.requesterAvatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={styles.avatarFallbackText}>
                        {req.requesterName[0]?.toUpperCase() ?? '?'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.meta}>
                    <Text style={styles.name} numberOfLines={1}>
                      {req.requesterName}
                    </Text>
                    <Text style={styles.handle} numberOfLines={1}>
                      {req.requesterHandle}
                    </Text>
                  </View>
                  <Pressable style={[styles.actionBtn, styles.rejectBtn]} onPress={() => onReject(req.notificationId)}>
                    <Text style={styles.rejectText}>Refuser</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, styles.acceptBtn]} onPress={() => onAccept(req.notificationId)}>
                    <Text style={styles.acceptText}>Accepter</Text>
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    minHeight: 280,
    maxHeight: '72%',
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginBottom: 10,
  },
  title: { fontSize: 19, fontWeight: '800', color: '#212121' },
  content: { paddingTop: 12, gap: 12 },
  infoText: { textAlign: 'center', color: '#6B7280', paddingVertical: 24, fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E5E7EB' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarFallbackText: { color: '#374151', fontWeight: '800' },
  meta: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  handle: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
  },
  rejectBtn: { backgroundColor: '#F3F4F6' },
  acceptBtn: { backgroundColor: '#F5D24A' },
  rejectText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  acceptText: { fontSize: 12, fontWeight: '700', color: '#1F2937' },
});

