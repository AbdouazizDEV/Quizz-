import { Modal, Pressable, StyleSheet, Text } from 'react-native';

import { ProfileTheme } from '@constants/profileTheme';

import type { ProfileFontFamilies } from './ProfileFonts';

interface CoverPhotoChangeModalProps {
  visible: boolean;
  onClose: () => void;
  onChoosePhoto: () => void;
  fonts: ProfileFontFamilies;
}

export function CoverPhotoChangeModal({
  visible,
  onClose,
  onChoosePhoto,
  fonts,
}: CoverPhotoChangeModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>
            Photo de couverture
          </Text>
          <Text style={[styles.body, fonts.medium && { fontFamily: fonts.medium }]}>
            Choisissez une nouvelle image pour la bannière de votre profil.
          </Text>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: ProfileTheme.primary500 }]}
            onPress={onChoosePhoto}
          >
            <Text style={[styles.primaryLabel, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
              Choisir une photo
            </Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.secondaryBtn}>
            <Text style={[styles.secondaryLabel, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
              Fermer
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: ProfileTheme.white,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: ProfileTheme.grey900,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: ProfileTheme.grey700,
  },
  primaryBtn: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  primaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: ProfileTheme.white,
  },
  secondaryBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: ProfileTheme.grey700,
  },
});
