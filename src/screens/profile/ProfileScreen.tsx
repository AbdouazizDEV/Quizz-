import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ProfileTabId } from '@app-types/profile.types';
import { CoverPhotoChangeModal } from '@components/ui/profile/CoverPhotoChangeModal';
import { ProfileHeaderSection } from '@components/ui/profile/ProfileHeaderSection';
import { HomeBottomNav } from '@components/ui/home/HomeBottomNav';
import { ProfileNavbar } from '@components/ui/profile/ProfileNavbar';
import { ProfileSegmentedTabs } from '@components/ui/profile/ProfileSegmentedTabs';
import { ProfileTabContent } from '@components/ui/profile/ProfileTabContent';
import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { useProfileScreenData } from '@hooks/useProfileScreenData';
import { getCoverPhotoPickerService } from '@services/profile/coverPhotoPickerInstance';

const BOTTOM_NAV_HEIGHT = 86;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, Spacing.onboardingMaxWidth);

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

  const { data, loading, error, refetch } = useProfileScreenData();
  const [tab, setTab] = useState<ProfileTabId>('quizzo');
  const [coverModalVisible, setCoverModalVisible] = useState(false);

  const onEditProfile = useCallback(() => {
    router.push(Routes.SETTINGS_PERSONAL);
  }, [router]);

  const onSettings = useCallback(() => {
    router.push(Routes.SETTINGS);
  }, [router]);

  const onActivity = useCallback(() => {
    router.push(Routes.STATISTICS);
  }, [router]);

  const onDirectMessages = useCallback(() => {
    router.push(Routes.NETWORK);
  }, [router]);

  const onChooseCoverPhoto = useCallback(async () => {
    const picker = getCoverPhotoPickerService();
    const result = await picker.openPicker();
    setCoverModalVisible(false);
    if (!result.cancelled) {
      Alert.alert('Photo', 'Nouvelle image sélectionnée (à persister côté API).');
    }
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', '#F8F8F8']} style={StyleSheet.absoluteFillObject} />

      {loading && !data ? (
        <View style={[styles.centered, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="#212121" />
        </View>
      ) : error ? (
        <View style={[styles.centered, { paddingTop: insets.top, paddingHorizontal: 24 }]}>
          <Text style={styles.errorText}>Impossible de charger le profil.</Text>
          <Text style={styles.retry} onPress={() => refetch()}>
            Réessayer
          </Text>
        </View>
      ) : data ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 16,
              paddingHorizontal: 24,
              paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 28,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.column, { maxWidth: contentWidth, width: '100%' }]}>
            <ProfileNavbar
              title="Profile"
              fonts={fonts}
              actions={{
                onSettings,
                onDirectMessages,
                onActivity,
              }}
            />

            <View style={styles.body}>
              <ProfileHeaderSection
                coverUri={data.identity.coverUri}
                displayName={data.identity.displayName}
                handle={data.identity.handle}
                avatarUri={data.identity.avatarUri}
                stats={data.stats}
                fonts={fonts}
                onEditProfile={onEditProfile}
                onPressChangeCover={() => setCoverModalVisible(true)}
              />

              <ProfileSegmentedTabs active={tab} onChange={setTab} fonts={fonts} />

              <ProfileTabContent
                tab={tab}
                quizTotalCount={data.quizTotalCount}
                quizzes={data.quizzes}
                fonts={fonts}
              />
            </View>
          </View>
        </ScrollView>
      ) : null}

      <HomeBottomNav height={BOTTOM_NAV_HEIGHT} />

      <CoverPhotoChangeModal
        visible={coverModalVisible}
        onClose={() => setCoverModalVisible(false)}
        onChoosePhoto={onChooseCoverPhoto}
        fonts={fonts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: {
    alignItems: 'center',
    gap: 28,
  },
  column: {
    alignItems: 'flex-start',
    gap: 24,
  },
  body: {
    width: '100%',
    gap: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: '#616161',
    textAlign: 'center',
  },
  retry: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C9A000',
  },
});
