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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import type { ProfileTabId } from '@app-types/profile.types';
import { ProfileAvatarActionSheet } from '@components/ui/profile/ProfileAvatarActionSheet';
import { CoverPhotoChangeModal } from '@components/ui/profile/CoverPhotoChangeModal';
import { ProfileHeaderSection } from '@components/ui/profile/ProfileHeaderSection';
import { HomeBottomNav } from '@components/ui/home/HomeBottomNav';
import { ProfileNavbar } from '@components/ui/profile/ProfileNavbar';
import { ProfileSegmentedTabs } from '@components/ui/profile/ProfileSegmentedTabs';
import { ProfileTabContent } from '@components/ui/profile/ProfileTabContent';
import { StatisticsNavbar } from '@components/ui/statistics/StatisticsNavbar';
import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { useProfileScreenData } from '@hooks/useProfileScreenData';
import { getCoverPhotoPickerService } from '@services/profile/coverPhotoPickerInstance';
import { ApiConnectionFollowService } from '@services/network/ApiConnectionFollowService';
import { uploadMyAvatar } from '@services/profile/profileAvatarApi';
import { uploadMyCover } from '@services/profile/profileCoverApi';

const BOTTOM_NAV_HEIGHT = 86;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const viewedUserId = typeof params.userId === 'string' ? params.userId : undefined;
  const isExternalProfile = Boolean(viewedUserId);
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

  const { data, loading, error, refetch } = useProfileScreenData(viewedUserId);
  const [tab, setTab] = useState<ProfileTabId>('quizzo');
  const [coverModalVisible, setCoverModalVisible] = useState(false);
  const [avatarSheetVisible, setAvatarSheetVisible] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [relationshipOverride, setRelationshipOverride] = useState<
    'self' | 'none' | 'pending' | 'friends' | null
  >(null);

  const effectiveRelationship = relationshipOverride ?? data?.identity.viewerRelationship ?? 'none';

  const identityActionVm = useMemo(() => {
    if (!isExternalProfile) {
      return {
        label: 'Edit Profile',
        variant: 'primary' as const,
        disabled: false,
      };
    }
    if (effectiveRelationship === 'friends') {
      return {
        label: data?.identity.gender === 'female' ? 'Amie' : 'Ami',
        variant: 'friend' as const,
        disabled: true,
      };
    }
    if (effectiveRelationship === 'pending') {
      return {
        label: 'En attente',
        variant: 'pending' as const,
        disabled: true,
      };
    }
    return {
      label: 'Suivre',
      variant: 'primary' as const,
      disabled: followBusy,
    };
  }, [data?.identity.gender, effectiveRelationship, followBusy, isExternalProfile]);

  const onEditProfile = useCallback(() => {
    if (isExternalProfile) {
      if (!viewedUserId) return;
      void (async () => {
        try {
          setFollowBusy(true);
          await new ApiConnectionFollowService().setFollowing(viewedUserId, true);
          setRelationshipOverride('pending');
          Alert.alert('Demande envoyée', "La demande d'ami a été envoyée.");
        } catch {
          Alert.alert('Erreur', "Impossible d'envoyer la demande d'ami.");
        } finally {
          setFollowBusy(false);
        }
      })();
      return;
    }
    setAvatarSheetVisible(true);
  }, [isExternalProfile, viewedUserId]);

  const onSettings = useCallback(() => {
    router.push(Routes.SETTINGS);
  }, [router]);

  const onActivity = useCallback(() => {
    router.push(Routes.STATISTICS);
  }, [router]);

  const onDirectMessages = useCallback(() => {
    router.push(Routes.NETWORK);
  }, [router]);


  useFocusEffect(
    useCallback(() => {
      setRelationshipOverride(null);
      void refetch();
    }, [refetch]),
  );

  const onChooseCoverPhoto = useCallback(async () => {
    try {
      setCoverBusy(true);
      const picker = getCoverPhotoPickerService();
      const result = await picker.openPicker();
      setCoverModalVisible(false);
      if (result.cancelled) return;
      if (!result.base64) {
        Alert.alert('Image', "Impossible de lire l'image sélectionnée.");
        return;
      }
      await uploadMyCover(result.base64);
      void refetch();
      Alert.alert('Profil', 'Photo de couverture mise à jour.');
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : "Mise à jour de la couverture impossible.");
    } finally {
      setCoverBusy(false);
    }
  }, [refetch]);

  const onChooseAvatarFromGallery = useCallback(async () => {
    try {
      setAvatarBusy(true);
      const picker = getCoverPhotoPickerService();
      const result = await picker.openPicker();
      if (result.cancelled) return;
      if (!result.base64) {
        Alert.alert('Image', "Impossible de lire l'image sélectionnée.");
        return;
      }
      await uploadMyAvatar(result.base64);
      setAvatarSheetVisible(false);
      void refetch();
      Alert.alert('Profil', 'Avatar mis à jour avec succès.');
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : "Mise à jour de l'avatar impossible.");
    } finally {
      setAvatarBusy(false);
    }
  }, [refetch]);

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
            {isExternalProfile ? (
              <StatisticsNavbar
                title={data.identity.displayName}
                fonts={fonts}
                onBack={() => router.back()}
                fullWidth
                rightAction={{ type: 'more', onPress: () => Alert.alert('Menu', 'Options à venir.') }}
              />
            ) : (
              <ProfileNavbar
                title="Profile"
                fonts={fonts}
                actions={{
                  onSettings,
                  onDirectMessages,
                  onActivity,
                }}
              />
            )}

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
                identityActionLabel={identityActionVm.label}
                identityActionVariant={identityActionVm.variant}
                identityActionDisabled={identityActionVm.disabled}
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

      {!isExternalProfile ? (
        <>
          <CoverPhotoChangeModal
            visible={coverModalVisible}
            onClose={() => setCoverModalVisible(false)}
            onChoosePhoto={onChooseCoverPhoto}
            fonts={fonts}
          />
          <ProfileAvatarActionSheet
            visible={avatarSheetVisible}
            onClose={() => setAvatarSheetVisible(false)}
            onPickGallery={() => void onChooseAvatarFromGallery()}
            fonts={fonts}
          />
        </>
      ) : null}
      {avatarBusy || coverBusy ? (
        <View style={styles.avatarBusyOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : null}
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
  avatarBusyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
