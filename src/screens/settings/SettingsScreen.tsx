import type { ComponentProps } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SettingsMenuEntry } from '@app-types/settingsMenu.types';
import { LogoutConfirmModal } from '@components/ui/settings/LogoutConfirmModal';
import { PremiumPromoCard } from '@components/ui/settings/PremiumPromoCard';
import { SettingsLeadingHeader } from '@components/ui/settings/SettingsLeadingHeader';
import { SettingsMenuRow } from '@components/ui/settings/SettingsMenuRow';
import { Routes } from '@constants/Routes';
import { SettingsScreenTheme } from '@constants/settingsScreenTheme';
import { signOutAndSyncStore } from '@services/auth/authSessionController';
import { getSettingsMenuEntries } from '@services/settings/settingsMenuRegistry';
import { useSettingsStore } from '@stores/settingsStore';
import { getNetworkHorizontalPadding } from '@utils/networkResponsiveLayout';

type FeatherName = ComponentProps<typeof Feather>['name'];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const horizontalPad = useMemo(() => getNetworkHorizontalPadding(screenWidth), [screenWidth]);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const darkMode = useSettingsStore((s) => s.darkMode);
  const setDarkMode = useSettingsStore((s) => s.setDarkMode);

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

  const menuEntries = useMemo(() => getSettingsMenuEntries(), []);

  const onBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(Routes.PROFILE);
  }, [router]);

  const openLogoutModal = useCallback(() => {
    setLogoutModalVisible(true);
  }, []);

  const closeLogoutModal = useCallback(() => {
    setLogoutModalVisible(false);
  }, []);

  const confirmLogout = useCallback(async () => {
    setLogoutModalVisible(false);
    await signOutAndSyncStore();
    router.replace(Routes.LOGIN);
  }, [router]);

  const renderRow = useCallback(
    (entry: SettingsMenuEntry) => {
      const icon = entry.icon as FeatherName;

      if (entry.kind === 'toggle') {
        return (
          <SettingsMenuRow
            key={entry.id}
            variant="toggle"
            label={entry.label}
            icon={icon}
            iconBackground={entry.iconBackground}
            iconColor={entry.iconColor}
            value={darkMode}
            onValueChange={setDarkMode}
            fonts={fonts}
          />
        );
      }

      if (entry.kind === 'logout') {
        return (
          <SettingsMenuRow
            key={entry.id}
            variant="nav"
            label={entry.label}
            icon={icon}
            iconBackground={entry.iconBackground}
            iconColor={entry.iconColor}
            onPress={openLogoutModal}
            fonts={fonts}
            danger
            showChevron={false}
          />
        );
      }

      return (
        <SettingsMenuRow
          key={entry.id}
          variant="nav"
          label={entry.label}
          icon={icon}
          iconBackground={entry.iconBackground}
          iconColor={entry.iconColor}
          onPress={() => router.push(entry.href)}
          fonts={fonts}
        />
      );
    },
    [fonts, router, darkMode, setDarkMode, openLogoutModal],
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', '#F8F8F8']} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + SettingsScreenTheme.pagePaddingTop,
            paddingHorizontal: horizontalPad,
            paddingBottom: SettingsScreenTheme.pagePaddingBottom + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <SettingsLeadingHeader title="Settings" onBack={onBack} fonts={fonts} />

          <View style={styles.body}>
            <PremiumPromoCard fonts={fonts} />
            <View style={styles.list}>{menuEntries.map(renderRow)}</View>
          </View>
        </View>
      </ScrollView>

      <LogoutConfirmModal
        visible={logoutModalVisible}
        onClose={closeLogoutModal}
        onConfirmLogout={confirmLogout}
        fonts={{ bold: fonts.bold, semiBold: fonts.semiBold }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    gap: SettingsScreenTheme.outerGap,
  },
  inner: {
    width: '100%',
    maxWidth: SettingsScreenTheme.contentMaxWidth,
    gap: SettingsScreenTheme.bodyGap,
    alignItems: 'stretch',
  },
  body: {
    width: '100%',
    gap: SettingsScreenTheme.bodyGap,
    alignItems: 'stretch',
  },
  list: {
    width: '100%',
    gap: 4,
  },
});
