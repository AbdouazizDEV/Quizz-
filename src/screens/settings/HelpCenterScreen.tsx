import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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

import { HelpContactRow } from '@components/ui/settings/HelpContactRow';
import { HelpFaqAccordionItem } from '@components/ui/settings/HelpFaqAccordionItem';
import { SettingsLeadingHeader } from '@components/ui/settings/SettingsLeadingHeader';
import { SettingsSectionCard } from '@components/ui/settings/SettingsSectionCard';
import { HELP_CONTACT_ENTRIES, HELP_FAQ_ENTRIES } from '@constants/helpCenterContent';
import { Routes } from '@constants/Routes';
import { SettingsScreenTheme } from '@constants/settingsScreenTheme';
import { getNetworkHorizontalPadding } from '@utils/networkResponsiveLayout';

export default function HelpCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontalPad = useMemo(() => getNetworkHorizontalPadding(width), [width]);

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
          <SettingsLeadingHeader title="Centre d'aide" onBack={onBack} fonts={fonts} />

          <LinearGradient colors={['#FFE066', '#FFB703']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.heroInner}>
              <View style={styles.heroIcon}>
                <Feather name="life-buoy" size={28} color="#1F2261" />
              </View>
              <Text style={[styles.heroTitle, fonts.bold && { fontFamily: fonts.bold }]}>
                Besoin d&apos;aide ?
              </Text>
              <Text style={[styles.heroSub, fonts.medium && { fontFamily: fonts.medium }]}>
                Retrouvez les réponses aux questions fréquentes ou contactez l&apos;équipe Quizz+.
              </Text>
            </View>
          </LinearGradient>

          <SettingsSectionCard title="Questions fréquentes" fonts={fonts}>
            {HELP_FAQ_ENTRIES.map((item, index) => (
              <HelpFaqAccordionItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                fonts={fonts}
                defaultOpen={index === 0}
              />
            ))}
          </SettingsSectionCard>

          <SettingsSectionCard title="Nous contacter" fonts={fonts}>
            {HELP_CONTACT_ENTRIES.map((entry) => (
              <HelpContactRow key={entry.id} entry={entry} fonts={fonts} />
            ))}
          </SettingsSectionCard>
        </View>
      </ScrollView>
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
});
