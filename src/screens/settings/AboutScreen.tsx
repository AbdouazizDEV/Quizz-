import { useCallback, useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import {
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { QuizzoLogoMark } from '@components/ui/brand/QuizzoLogoMark';
import { AboutFeatureCard } from '@components/ui/settings/AboutFeatureCard';
import { SettingsLeadingHeader } from '@components/ui/settings/SettingsLeadingHeader';
import { SettingsSectionCard } from '@components/ui/settings/SettingsSectionCard';
import {
  ABOUT_APP_NAME,
  ABOUT_DESCRIPTION,
  ABOUT_FEATURES,
  ABOUT_LINKS,
  ABOUT_TAGLINE,
} from '@constants/aboutContent';
import { Routes } from '@constants/Routes';
import { SettingsScreenTheme } from '@constants/settingsScreenTheme';
import { getNetworkHorizontalPadding } from '@utils/networkResponsiveLayout';

const FEATURE_ICONS = ['layers', 'zap', 'users'] as const;

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontalPad = useMemo(() => getNetworkHorizontalPadding(width), [width]);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

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
          <SettingsLeadingHeader title={`À propos de ${ABOUT_APP_NAME}`} onBack={onBack} fonts={fonts} />

          <LinearGradient colors={['#FFE066', '#FFB703']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.heroInner}>
              <View style={styles.logoRing}>
                <QuizzoLogoMark size={56} />
              </View>
              <Text style={[styles.appName, fonts.bold && { fontFamily: fonts.bold }]}>{ABOUT_APP_NAME}</Text>
              <Text style={[styles.tagline, fonts.semiBold && { fontFamily: fonts.semiBold }]}>{ABOUT_TAGLINE}</Text>
              <View style={styles.versionPill}>
                <Text style={[styles.versionTxt, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
                  Version {appVersion}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <SettingsSectionCard fonts={fonts}>
            <Text style={[styles.description, fonts.medium && { fontFamily: fonts.medium }]}>{ABOUT_DESCRIPTION}</Text>
          </SettingsSectionCard>

          <SettingsSectionCard title="Ce que propose l'app" fonts={fonts}>
            {ABOUT_FEATURES.map((feature, index) => (
              <AboutFeatureCard
                key={feature.id}
                title={feature.title}
                body={feature.body}
                icon={FEATURE_ICONS[index] ?? 'layers'}
                fonts={fonts}
              />
            ))}
          </SettingsSectionCard>

          <SettingsSectionCard title="Liens utiles" fonts={fonts}>
            {ABOUT_LINKS.map((link) => (
              <Pressable
                key={link.id}
                style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.88 }]}
                onPress={() => void Linking.openURL(link.url)}
              >
                <Text style={[styles.linkLabel, fonts.semiBold && { fontFamily: fonts.semiBold }]}>{link.label}</Text>
                <Feather name="external-link" size={18} color="#BDBDBD" />
              </Pressable>
            ))}
          </SettingsSectionCard>

          <Text style={[styles.footer, fonts.medium && { fontFamily: fonts.medium }]}>
            © {new Date().getFullYear()} {ABOUT_APP_NAME} · DIGIGROUP
          </Text>
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
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF8E1',
    borderWidth: 3,
    borderColor: '#FFE082',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appName: { fontSize: 32, fontWeight: '900', color: '#1F2261', letterSpacing: 0.5 },
  tagline: { fontSize: 15, fontWeight: '700', color: '#616161', textAlign: 'center' },
  versionPill: {
    marginTop: 8,
    backgroundColor: '#FFF3D6',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  versionTxt: { fontSize: 13, fontWeight: '700', color: '#1F2261' },
  description: { fontSize: 15, lineHeight: 22, color: '#424242' },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  linkLabel: { fontSize: 15, fontWeight: '700', color: '#212121' },
  footer: { textAlign: 'center', fontSize: 12, color: '#9E9E9E', marginTop: 4 },
});
