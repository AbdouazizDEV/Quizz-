import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProfileFontFamilies } from './ProfileFonts';

interface ProfileAvatarActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onPickGallery: () => void;
  fonts: ProfileFontFamilies;
}

export function ProfileAvatarActionSheet({
  visible,
  onClose,
  onPickGallery,
  fonts,
}: ProfileAvatarActionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>Modifier le profil</Text>
          <Text style={[styles.body, fonts.medium && { fontFamily: fonts.medium }]}>
            Choisissez une photo depuis votre galerie pour mettre à jour votre avatar.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={onPickGallery}>
            <Text style={[styles.primaryLabel, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
              Choisir depuis la galerie
            </Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.secondaryBtn}>
            <Text style={[styles.secondaryLabel, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
              Annuler
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
    gap: 12,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  body: { fontSize: 14, lineHeight: 20, color: '#6B7280' },
  primaryBtn: {
    marginTop: 4,
    borderRadius: 100,
    backgroundColor: '#F5D24A',
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryLabel: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  secondaryBtn: {
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryLabel: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
});

