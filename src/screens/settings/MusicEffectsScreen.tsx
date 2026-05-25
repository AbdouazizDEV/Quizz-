import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import {
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { MusicSoundSlotRow } from '@components/ui/settings/MusicSoundSlotRow';
import { QuizSoundPickerModal } from '@components/ui/settings/QuizSoundPickerModal';
import { SettingsLeadingHeader } from '@components/ui/settings/SettingsLeadingHeader';
import { SettingsMenuRow } from '@components/ui/settings/SettingsMenuRow';
import { SettingsSectionCard } from '@components/ui/settings/SettingsSectionCard';
import { QUIZ_SOUND_SLOT_META } from '@constants/quizSoundSlots';
import { Routes } from '@constants/Routes';
import { SettingsScreenTheme } from '@constants/settingsScreenTheme';
import { useQuizSoundPreferencesStore } from '@stores/quizSoundPreferencesStore';
import { useSettingsStore } from '@stores/settingsStore';
import { getNetworkHorizontalPadding } from '@utils/networkResponsiveLayout';

import type { QuizSoundSlot } from '@app-types/quizSoundPreferences.types';

export default function MusicEffectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontalPad = useMemo(() => getNetworkHorizontalPadding(width), [width]);

  const musicEnabled = useSettingsStore((s) => s.musicEnabled);
  const setMusicEnabled = useSettingsStore((s) => s.setMusicEnabled);
  const sounds = useQuizSoundPreferencesStore((s) => s.sounds);
  const setSoundForSlot = useQuizSoundPreferencesStore((s) => s.setSoundForSlot);
  const resetToDefaults = useQuizSoundPreferencesStore((s) => s.resetToDefaults);

  const [pickerSlot, setPickerSlot] = useState<QuizSoundSlot | null>(null);

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_500Medium,
  });

  const fonts = useMemo(
    () => ({
      bold: fontsLoaded ? 'Nunito_700Bold' : undefined,
      semiBold: fontsLoaded ? 'Nunito_600SemiBold' : undefined,
      medium: fontsLoaded ? 'Nunito_500Medium' : undefined,
    }),
    [fontsLoaded],
  );

  const onBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(Routes.SETTINGS);
  }, [router]);

  const pickerMeta = useMemo(
    () => (pickerSlot ? QUIZ_SOUND_SLOT_META.find((m) => m.slot === pickerSlot) : null),
    [pickerSlot],
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', '#FFF8E1']} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + SettingsScreenTheme.pagePaddingTop,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: horizontalPad,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <SettingsLeadingHeader title="Musique et effets" onBack={onBack} fonts={fonts} />

          <LinearGradient colors={['#FFE066', '#FFB703']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.heroInner}>
              <View style={styles.heroIcon}>
                <Feather name="volume-2" size={28} color="#1F2261" />
              </View>
              <Text style={[styles.heroTitle, fonts.bold && { fontFamily: fonts.bold }]}>
                Personnalise tes sons
              </Text>
              <Text style={[styles.heroSub, fonts.medium && { fontFamily: fonts.medium }]}>
                Choisis un son pour chaque moment du quiz. Appuie sur ▶ pour écouter un aperçu.
              </Text>
            </View>
          </LinearGradient>

          <SettingsSectionCard fonts={fonts}>
            <SettingsMenuRow
              variant="toggle"
              label="Activer les sons du quiz"
              icon="volume-2"
              iconBackground="#EDE7F6"
              iconColor="#F9A825"
              value={musicEnabled}
              onValueChange={setMusicEnabled}
              fonts={fonts}
            />
          </SettingsSectionCard>

          <SettingsSectionCard title="Pendant le quiz" fonts={fonts}>
            {QUIZ_SOUND_SLOT_META.filter((m) => m.slot === 'correctAnswer' || m.slot === 'wrongAnswer').map(
              (meta) => (
                <MusicSoundSlotRow
                  key={meta.slot}
                  meta={meta}
                  selectedSoundId={sounds[meta.slot]}
                  onPress={() => setPickerSlot(meta.slot)}
                  fonts={fonts}
                />
              ),
            )}
          </SettingsSectionCard>

          <SettingsSectionCard title="Fin de quiz" fonts={fonts}>
            {QUIZ_SOUND_SLOT_META.filter(
              (m) => m.slot === 'victoryPerfect' || m.slot === 'victoryPartial' || m.slot === 'defeat',
            ).map((meta) => (
              <MusicSoundSlotRow
                key={meta.slot}
                meta={meta}
                selectedSoundId={sounds[meta.slot]}
                onPress={() => setPickerSlot(meta.slot)}
                fonts={fonts}
              />
            ))}
          </SettingsSectionCard>

          <Pressable
            onPress={resetToDefaults}
            style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.88 }]}
          >
            <Feather name="rotate-ccw" size={18} color="#616161" />
            <Text style={[styles.resetTxt, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
              Réinitialiser les sons par défaut
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {pickerSlot && pickerMeta ? (
        <QuizSoundPickerModal
          visible={Boolean(pickerSlot)}
          title={pickerMeta.title}
          selectedId={sounds[pickerSlot]}
          onClose={() => setPickerSlot(null)}
          onSelect={(id) => {
            setSoundForSlot(pickerSlot, id);
            setPickerSlot(null);
          }}
          fonts={fonts}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { width: '100%', maxWidth: SettingsScreenTheme.contentMaxWidth, gap: 20 },
  hero: { borderRadius: 22, padding: 3 },
  heroInner: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 19,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#1F2261', textAlign: 'center' },
  heroSub: { fontSize: 14, color: '#616161', textAlign: 'center', lineHeight: 20 },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  resetTxt: { fontSize: 14, fontWeight: '700', color: '#616161' },
});
