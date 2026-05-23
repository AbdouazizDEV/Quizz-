import { useCallback, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@components/ui/common/AppHeader';
import { DefisFeaturedChallengeCard } from '@components/ui/defis/DefisFeaturedChallengeCard';
import { DefisQuickStatsSection } from '@components/ui/defis/DefisQuickStatsSection';
import { DefisSummaryCard } from '@components/ui/defis/DefisSummaryCard';
import { HomeActionTiles } from '@components/ui/home/HomeActionTiles';
import { HomeBottomNav } from '@components/ui/home/HomeBottomNav';
import { DefisRoutes } from '@constants/defisRoutes';
import type { HomeActionTileId } from '@constants/homeActionTiles';
import { COLORS } from '@constants/Colors';
import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { useDefisDashboard } from '@hooks/defis/useDefisDashboard';
import { useAuthMe } from '@hooks/useAuthMe';
import { buildDefisSummaryItems } from '@utils/defis/buildDefisSummaryItems';

const BOTTOM_NAV_HEIGHT = 86;

export default function DefisScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, Spacing.onboardingMaxWidth);

  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id;
  const { data, isLoading, isError } = useDefisDashboard(userId);

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
  });

  const summaryItems = useMemo(
    () =>
      buildDefisSummaryItems({
        activeChallengeCount: data?.activeChallengeCount ?? 0,
        activeTournamentCount: data?.activeTournamentCount ?? 0,
        pendingDuelCount: data?.pendingDuelCount ?? 0,
      }),
    [data],
  );

  const activePulse = useMemo(
    () => ({
      challenge: (data?.activeChallengeCount ?? 0) > 0,
      tournament: (data?.activeTournamentCount ?? 0) > 0,
      duel: (data?.pendingDuelCount ?? 0) > 0,
    }),
    [data],
  );

  const onSummaryPress = useCallback(
    (id: 'challenge' | 'tournament' | 'duel') => {
      if (id === 'challenge') router.push(DefisRoutes.challengeList);
      if (id === 'tournament') router.push(DefisRoutes.tournoiList);
      if (id === 'duel') router.push(DefisRoutes.duelHub);
    },
    [router],
  );

  const onTilePress = useCallback(
    (tileId: HomeActionTileId) => {
      if (tileId === 'challenge') router.push(DefisRoutes.challengeList);
      if (tileId === 'tournament') router.push(DefisRoutes.tournoiList);
      if (tileId === 'duel') router.push(DefisRoutes.duelHub);
    },
    [router],
  );

  const onWeekChallengePress = useCallback(() => {
    if (data?.currentWeekChallenge?.id) {
      router.push(DefisRoutes.challengeDetail(data.currentWeekChallenge.id));
    }
  }, [data?.currentWeekChallenge?.id, router]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', COLORS.background]} style={styles.bgGradient} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: Spacing.screenHorizontal,
          paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 32,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.column, { maxWidth: contentWidth, width: contentWidth }]}>
          <AppHeader title="Défis" onBack={() => router.replace(Routes.HOME)} />

          {isLoading && !data ? (
            <ActivityIndicator color={COLORS.primary} style={styles.loader} />
          ) : null}

          {isError ? (
            <Text style={[styles.error, fontsLoaded && { fontFamily: 'Nunito_600SemiBold' }]}>
              Impossible de charger les défis. Réessayez plus tard.
            </Text>
          ) : null}

          <DefisSummaryCard items={summaryItems} onItemPress={onSummaryPress} />

          <HomeActionTiles onTilePress={onTilePress} activePulse={activePulse} />

          <DefisFeaturedChallengeCard
            eyebrow="Challenge de la semaine"
            title={data?.currentWeekChallenge?.title ?? ''}
            endsAt={data?.currentWeekChallenge?.endsAt}
            emptyMessage={!data?.currentWeekChallenge ? 'Aucun challenge cette semaine' : undefined}
            rewardHint="Récompenses à gagner"
            index={3}
            onPress={data?.currentWeekChallenge ? onWeekChallengePress : undefined}
          />

          {data ? (
            <DefisQuickStatsSection
              defiPlayed={data.userStats.defiPlayed}
              bestRank={data.userStats.bestRank}
              duelsWon={data.userStats.duelsWon}
              duelsTotal={data.userStats.duelsTotal}
            />
          ) : null}
        </View>
      </ScrollView>

      <HomeBottomNav height={BOTTOM_NAV_HEIGHT} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  bgGradient: { ...StyleSheet.absoluteFillObject },
  scroll: { flex: 1 },
  column: {
    gap: 18,
  },
  loader: {
    marginVertical: 12,
  },
  error: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
});
