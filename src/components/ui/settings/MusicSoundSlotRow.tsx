import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { QuizSoundSlotMeta } from '@constants/quizSoundSlots';
import { getQuizSoundLabel } from '@constants/quizSoundCatalog';
import { SettingsScreenTheme } from '@constants/settingsScreenTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

type FeatherName = ComponentProps<typeof Feather>['name'];

interface MusicSoundSlotRowProps {
  meta: QuizSoundSlotMeta;
  selectedSoundId: string;
  onPress: () => void;
  fonts: ProfileFontFamilies;
}

export function MusicSoundSlotRow({ meta, selectedSoundId, onPress, fonts }: MusicSoundSlotRowProps) {
  const soundLabel = getQuizSoundLabel(selectedSoundId);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel={`${meta.title}, son actuel ${soundLabel}`}
    >
      <View style={[styles.iconBubble, { backgroundColor: meta.iconBackground }]}>
        <Feather name={meta.icon as FeatherName} size={20} color={meta.iconColor} />
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.title, fonts.semiBold && { fontFamily: fonts.semiBold }]}>{meta.title}</Text>
        <Text style={[styles.desc, fonts.medium && { fontFamily: fonts.medium }]} numberOfLines={2}>
          {meta.description}
        </Text>
        <Text style={[styles.sound, fonts.semiBold && { fontFamily: fonts.semiBold }]}>{soundLabel}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#BDBDBD" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '700', color: SettingsScreenTheme.grey900 },
  desc: { fontSize: 12, lineHeight: 17, color: '#9E9E9E' },
  sound: { fontSize: 13, fontWeight: '700', color: '#FFB703', marginTop: 4 },
});
