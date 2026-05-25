import { useCallback } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QUIZ_SOUND_CATALOG } from '@constants/quizSoundCatalog';
import { previewQuizSound } from '@services/quiz/play/playQuizSoundForSlot';
import { SettingsScreenTheme } from '@constants/settingsScreenTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface QuizSoundPickerModalProps {
  visible: boolean;
  title: string;
  selectedId: string;
  onClose: () => void;
  onSelect: (soundId: string) => void;
  fonts: ProfileFontFamilies;
}

export function QuizSoundPickerModal({
  visible,
  title,
  selectedId,
  onClose,
  onSelect,
  fonts,
}: QuizSoundPickerModalProps) {
  const insets = useSafeAreaInsets();

  const onPreview = useCallback((soundId: string) => {
    void previewQuizSound(soundId);
  }, []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdropTouchable} onPress={onClose}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.dimOverlay} pointerEvents="none" />
        </Pressable>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>{title}</Text>
          <Text style={[styles.sub, fonts.medium && { fontFamily: fonts.medium }]}>
            {QUIZ_SOUND_CATALOG.length} sons disponibles
          </Text>

          <FlatList
            data={QUIZ_SOUND_CATALOG}
            keyExtractor={(item) => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = item.id === selectedId;
              return (
                <View style={styles.row}>
                  <Pressable
                    style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.88 }]}
                    onPress={() => {
                      onClose();
                      onSelect(item.id);
                    }}
                  >
                    <Feather
                      name={selected ? 'check-circle' : 'circle'}
                      size={22}
                      color={selected ? '#FFB703' : '#BDBDBD'}
                    />
                    <View style={styles.labelCol}>
                      <Text style={[styles.label, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.file, fonts.medium && { fontFamily: fonts.medium }]} numberOfLines={1}>
                        {item.fileName}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => onPreview(item.id)}
                    style={({ pressed }) => [styles.playBtn, pressed && { opacity: 0.85 }]}
                    accessibilityLabel={`Écouter ${item.label}`}
                  >
                    <Feather name="play" size={18} color="#1F2261" />
                  </Pressable>
                </View>
              );
            }}
          />

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeTxt, fonts.semiBold && { fontFamily: fonts.semiBold }]}>Fermer</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdropTouchable: { ...StyleSheet.absoluteFillObject },
  dimOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    maxHeight: '78%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '800', color: SettingsScreenTheme.grey900 },
  sub: { fontSize: 13, color: '#9E9E9E', marginBottom: 12 },
  list: { maxHeight: 360 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  labelCol: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontWeight: '700', color: '#212121' },
  file: { fontSize: 11, color: '#BDBDBD' },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  closeTxt: { fontSize: 16, fontWeight: '700', color: '#616161' },
});
