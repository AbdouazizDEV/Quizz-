import { useCallback, useMemo } from 'react';
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

import { AchievementsSection } from '@components/ui/statistics/AchievementsSection';
import { StatisticsNavbar } from '@components/ui/statistics/StatisticsNavbar';
import { WeeklyPointsChartCard } from '@components/ui/statistics/WeeklyPointsChartCard';
import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { StatisticsTheme } from '@constants/statisticsTheme';
import { useStatisticsScreenData } from '@hooks/useStatisticsScreenData';

export default function MyStatisticsScreen() {
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

  const { data, loading, error, refetch } = useStatisticsScreenData();

  const onBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(Routes.PROFILE);
  }, [router]);

  const onMore = useCallback(() => {
    Alert.alert('My Statistics', 'Options à venir.');
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
          <Text style={styles.errorText}>Impossible de charger les statistiques.</Text>
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
              paddingBottom: StatisticsTheme.globalPaddingBottom + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.inner, { maxWidth: contentWidth, width: '100%' }]}>
            <StatisticsNavbar
              title="My Statistics"
              fonts={fonts}
              onBack={onBack}
              rightAction={{ type: 'more', onPress: onMore }}
            />

            <View style={styles.body}>
              <WeeklyPointsChartCard weekly={data.weekly} fonts={fonts} />
              <AchievementsSection achievements={data.achievements} fonts={fonts} />
            </View>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: {
    alignItems: 'center',
    gap: StatisticsTheme.globalGap,
  },
  inner: {
    alignItems: 'flex-start',
    gap: StatisticsTheme.sectionGap,
  },
  body: {
    width: '100%',
    gap: StatisticsTheme.bodyGap,
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
