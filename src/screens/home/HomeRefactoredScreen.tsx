import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeActionTiles } from '@components/ui/home/HomeActionTiles';
import { HomeBottomNav } from '@components/ui/home/HomeBottomNav';
import { HomeDailyCategoriesSection } from '@components/ui/home/HomeDailyCategoriesSection';
import { HomeHeaderCard } from '@components/ui/home/HomeHeaderCard';
import { HomeNotificationsSheet } from '@components/ui/home/HomeNotificationsSheet';
import { NotificationDeleteConfirmModal } from '@components/ui/settings/NotificationDeleteConfirmModal';
import { NotificationMessageModal } from '@components/ui/settings/NotificationMessageModal';
import { HomeSettingsDrawer } from '@components/ui/home/HomeSettingsDrawer';
import { HomeTopNavbar } from '@components/ui/home/HomeTopNavbar';
import { HomeInsightCarousel, type HomeInsightItem } from '@components/ui/home/HomeInsightCarousel';
import {
  HomeLeaderboardSection,
  type HomeLeaderboardUser,
} from '@components/ui/home/HomeLeaderboardSection';
import { HomeRewardsSection } from '@components/ui/home/HomeRewardsSection';
import { HomeSectionTitle } from '@components/ui/home/HomeSectionTitle';
import type { AppNotification } from '@app-types/notification.types';
import { buildUserProfileHref, Routes } from '@constants/Routes';
import { DefisRoutes } from '@constants/defisRoutes';
import type { HomeActionTileId } from '@constants/homeActionTiles';
import { Spacing } from '@constants/Spacing';
import { useCategoriesExplore } from '@hooks/useCategoriesExplore';
import { useAuthMe } from '@hooks/useAuthMe';
import { useGlobalLeaderboard } from '@hooks/useGlobalLeaderboard';
import { useAuthStore } from '@stores/authStore';
import { canVisitorAccessCategory, isVisitorSession } from '@services/auth/visitorAccessPolicy';
import { useNotifications } from '@hooks/useNotifications';
import { useNotificationInteractions } from '@hooks/useNotificationInteractions';
import { getUserAvatarUri } from '@utils/getUserAvatarUri';
import {
  elapsedDaysSince,
  estimateLevelProgress,
  firstNameFromDisplay,
  formatJoursLabel,
  formatLevelCodeLabel,
  initialsFromName,
  levelCodeFromScore,
  levelProgressEndpoints,
} from '@utils/levelDisplay';
import { useAppError } from '@providers/AppErrorProvider';

const BOTTOM_NAV_HEIGHT = 86;

const INSIGHTS: HomeInsightItem[] = [
  {
    id: 'savoir-1',
    title: 'Le cerveau adore les quiz courts',
    body: 'Des sessions de 3 a 5 minutes ameliorent la memorisation a long terme.',
    tag: 'Neurosciences',
    gradient: ['#EEF2FF', '#E0E7FF'],
  },
  {
    id: 'savoir-2',
    title: 'Repondre vite aide la concentration',
    body: "Limiter le temps de reponse active l'attention et reduit la distraction.",
    tag: 'Productivite',
    gradient: ['#FFF7D6', '#FFE9A8'],
  },
  {
    id: 'savoir-3',
    title: 'La repetition espacee fonctionne',
    body: 'Rejouer un quiz 24h puis 72h plus tard ancre les connaissances.',
    tag: 'Methode',
    gradient: ['#E8FAF2', '#CCF1E2'],
  },
];

export default function HomeRefactoredScreen() {
  const router = useRouter();
  const { showAppError } = useAppError();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, Spacing.onboardingMaxWidth);
  const carouselRef = useRef<FlatList<HomeInsightItem> | null>(null);
  const [activeInsight, setActiveInsight] = useState(0);
  const glowAnim = useRef(new Animated.Value(0.35)).current;
  const token = useAuthStore((s) => s.token);
  const hasRegisteredAccount = useAuthStore((s) => s.hasRegisteredAccount);
  const { data: me, loading: meLoading, refetch: refetchAuthMe } = useAuthMe();
  const { items: leaderboardRows, refetch: refetchLeaderboard } = useGlobalLeaderboard(5);
  const { data: allCategories, loading: categoriesLoading } = useCategoriesExplore();
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const {
    items: notifications,
    unreadCount,
    loading: notificationsLoading,
    actionId: notificationActionId,
    refresh: refreshNotifications,
    markRead,
    markAllRead,
    remove: removeNotification,
    acceptFriend,
    rejectFriend,
    acceptDuel,
    rejectDuel,
  } = useNotifications();
  const {
    messageItem,
    deleteTarget,
    deleteBusy,
    handlePress: handleNotificationPress,
    requestDelete,
    cancelDelete,
    confirmDelete,
    closeMessage,
  } = useNotificationInteractions({
    markRead,
    remove: removeNotification,
    onNavigate: () => setNotificationsVisible(false),
  });

  const isVisitor = useMemo(
    () => isVisitorSession({ token, hasRegisteredAccount }),
    [token, hasRegisteredAccount],
  );

  useFocusEffect(
    useCallback(() => {
      void refetchAuthMe({ force: false });
      void refetchLeaderboard();
      if (token?.trim()) {
        void refreshNotifications();
      }
    }, [refetchAuthMe, refetchLeaderboard, refreshNotifications, token]),
  );

  const openNotifications = useCallback(async () => {
    setNotificationsVisible(true);
    if (!token?.trim()) return;
    try {
      await refreshNotifications();
    } catch {
      showAppError('Impossible de charger les notifications pour le moment.', {
        title: 'Notifications',
        onRetry: () => void openNotifications(),
      });
    }
  }, [refreshNotifications, showAppError, token]);

  const onAcceptDuelNotification = useCallback(
    async (item: AppNotification) => {
      try {
        const duelId = await acceptDuel(item);
        setNotificationsVisible(false);
        router.push(DefisRoutes.duelDetail(duelId) as never);
      } catch (error) {
        showAppError(error instanceof Error ? error.message : "Impossible d'accepter le duel.", {
          title: 'Duel',
        });
      }
    },
    [acceptDuel, router, showAppError],
  );

  const onRejectDuelNotification = useCallback(
    async (item: AppNotification) => {
      try {
        await rejectDuel(item);
      } catch (error) {
        showAppError(error instanceof Error ? error.message : 'Impossible de refuser le duel.', {
          title: 'Duel',
        });
      }
    },
    [rejectDuel, showAppError],
  );

  const topThreeCategories = useMemo(() => allCategories.slice(0, 3), [allCategories]);

  const goToAllCategories = useCallback(() => {
    router.push(Routes.CATEGORIES);
  }, [router]);

  const goToCategory = useCallback(
    (categorySlug: string) => {
      if (
        isVisitorSession({ token, hasRegisteredAccount }) &&
        !canVisitorAccessCategory({ slug: categorySlug })
      ) {
        router.push(Routes.LOGIN);
        return;
      }
      router.push(`${Routes.CATEGORIES}/${categorySlug}`);
    },
    [hasRegisteredAccount, router, token],
  );
  const goToScoreboard = useCallback(() => {
    router.push(Routes.PLAYERS);
  }, [router]);

  const goToProfile = useCallback(() => {
    router.push(Routes.PROFILE);
  }, [router]);

  const goToSearch = useCallback(() => {
    router.push(Routes.CATEGORIES);
  }, [router]);

  const goToDefisTile = useCallback(
    (tileId: HomeActionTileId) => {
      switch (tileId) {
        case 'challenge':
          router.push(DefisRoutes.challengeList);
          break;
        case 'tournament':
          router.push(DefisRoutes.tournoiList);
          break;
        case 'duel':
          router.push(DefisRoutes.duelHub);
          break;
      }
    },
    [router],
  );

  const openSettingsMenu = useCallback(() => {
    setSettingsDrawerVisible(true);
  }, []);

  useEffect(() => {
    const nativeDriver = Platform.OS !== 'web';
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.85, duration: 1400, useNativeDriver: nativeDriver }),
        Animated.timing(glowAnim, { toValue: 0.35, duration: 1400, useNativeDriver: nativeDriver }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [glowAnim]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveInsight((prev) => {
        const next = (prev + 1) % INSIGHTS.length;
        carouselRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const headerVm = useMemo(() => {
    const profile = me?.profile;
    const meta = me?.user?.user_metadata as Record<string, unknown> | undefined;
    const userRaw = me?.user as Record<string, unknown> | undefined;
    const display =
      profile?.full_name?.trim() ||
      (typeof meta?.full_name === 'string' ? meta.full_name.trim() : '') ||
      (typeof meta?.username === 'string' ? meta.username.trim() : '') ||
      '';
    const first = firstNameFromDisplay(display || 'Joueur');
    const initials = initialsFromName(display || first);
    const score = profile?.total_score ?? 0;
    const levelCode = levelCodeFromScore(score);
    const progress = estimateLevelProgress(score);
    const { left, right } = levelProgressEndpoints(score);
    const streak = profile?.streak_days ?? 0;
    const createdAt = typeof userRaw?.created_at === 'string' ? userRaw.created_at : undefined;
    const elapsedDays = elapsedDaysSince(createdAt);
    const daysActive = Math.max(profile?.days_active ?? 0, elapsedDays);
    const clockLabel =
      streak > 0 ? formatJoursLabel(streak) : daysActive > 0 ? formatJoursLabel(daysActive) : '0 jour';
    const loadingPlaceholders = Boolean(token?.trim()) && meLoading;

    return {
      userId: me?.user?.id,
      avatarInitial: initials,
      avatarUri: getUserAvatarUri(
        me?.user?.id ?? 'me',
        profile?.avatar_url ?? (typeof meta?.avatar_url === 'string' ? meta.avatar_url : undefined),
      ),
      displayNameWithEmoji: loadingPlaceholders ? '··· 👋' : `${first} 👋`,
      totalScoreDisplay: loadingPlaceholders ? '—' : String(score),
      levelLabel: formatLevelCodeLabel(levelCode),
      rankLabel: '#—',
      streakOrDaysLabel: loadingPlaceholders ? '···' : clockLabel,
      progressLabelLeft: left,
      progressLabelRight: right,
      progress,
    };
  }, [me, meLoading, token]);

  const leaderboardUsers = useMemo<HomeLeaderboardUser[]>(
    () =>
      leaderboardRows.map((row, idx) => ({
        id: row.id,
        name: row.displayName,
        points: row.score,
        avatar: row.avatarUrl,
        rank: row.rank || idx + 1,
      })),
    [leaderboardRows],
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', '#F8F8F8']} style={styles.bgGradient} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 14,
            paddingHorizontal: Spacing.screenHorizontal,
            paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.column, { maxWidth: contentWidth }]}>
          <HomeTopNavbar
            notificationCount={unreadCount}
            onPressSearch={goToSearch}
            onPressNotifications={() => void openNotifications()}
            onPressMenu={openSettingsMenu}
          />

          <HomeHeaderCard
            glowOpacity={glowAnim}
            progress={headerVm.progress}
            userId={headerVm.userId}
            avatarInitial={headerVm.avatarInitial}
            avatarUri={headerVm.avatarUri}
            displayNameWithEmoji={headerVm.displayNameWithEmoji}
            totalScoreDisplay={headerVm.totalScoreDisplay}
            levelLabel={headerVm.levelLabel}
            rankLabel={headerVm.rankLabel}
            streakOrDaysLabel={headerVm.streakOrDaysLabel}
            progressLabelLeft={headerVm.progressLabelLeft}
            progressLabelRight={headerVm.progressLabelRight}
            onPressAvatar={goToProfile}
          />

          <View style={styles.section}>
            <HomeSectionTitle title="Le savoir du jour" />
            <HomeInsightCarousel
              insights={INSIGHTS}
              contentWidth={contentWidth}
              activeIndex={activeInsight}
              onChangeIndex={setActiveInsight}
              carouselRef={carouselRef}
            />
          </View>

          <View style={styles.section}>
            <HomeSectionTitle title="Quizz du jour" action="Voir tout" onActionPress={goToAllCategories} />
            <HomeDailyCategoriesSection
              categories={topThreeCategories}
              loading={categoriesLoading}
              onPressCategory={goToCategory}
            />
          </View>

          <HomeActionTiles onTilePress={goToDefisTile} />

          <Pressable style={styles.section} onPress={goToScoreboard} accessibilityRole="button">
            <HomeSectionTitle
              title="Top classement"
              action="Voir complet"
              onActionPress={goToScoreboard}
            />
            <HomeLeaderboardSection
              users={leaderboardUsers}
              onPressAvatar={(userId) => router.push(buildUserProfileHref(userId))}
            />
          </Pressable>

          <View style={styles.section}>
            <HomeSectionTitle title="Voir mes récompenses" />
            <HomeRewardsSection />
          </View>
        </View>
      </ScrollView>

      <HomeBottomNav height={BOTTOM_NAV_HEIGHT} />

      <HomeNotificationsSheet
        visible={notificationsVisible}
        loading={notificationsLoading}
        items={notifications}
        unreadCount={unreadCount}
        actionId={notificationActionId}
        onClose={() => setNotificationsVisible(false)}
        onMarkAllRead={() => void markAllRead()}
        onPressItem={(item) => void handleNotificationPress(item)}
        onDeleteRequest={requestDelete}
        onAcceptFriend={(id) => void acceptFriend(id)}
        onRejectFriend={(id) => void rejectFriend(id)}
        onAcceptDuel={(item) => void onAcceptDuelNotification(item)}
        onRejectDuel={(item) => void onRejectDuelNotification(item)}
        onSeeAll={() => {
          setNotificationsVisible(false);
          router.push(Routes.SETTINGS_NOTIFICATIONS);
        }}
      />
      <NotificationMessageModal item={messageItem} fonts={{}} onClose={closeMessage} />
      <NotificationDeleteConfirmModal
        item={deleteTarget}
        busy={deleteBusy}
        fonts={{}}
        onCancel={cancelDelete}
        onConfirm={() => void confirmDelete()}
      />
      <HomeSettingsDrawer
        visible={settingsDrawerVisible}
        onClose={() => setSettingsDrawerVisible(false)}
        isVisitor={isVisitor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  bgGradient: { ...StyleSheet.absoluteFillObject },
  scroll: { flex: 1 },
  scrollContent: { alignItems: 'center' },
  column: { width: '100%', gap: 22 },
  section: { gap: 12 },
});
