import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Platform,
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
import { HomeInsightCarousel, type HomeInsightItem } from '@components/ui/home/HomeInsightCarousel';
import {
  HomeLeaderboardSection,
  type HomeLeaderboardUser,
} from '@components/ui/home/HomeLeaderboardSection';
import { HomeRewardsSection } from '@components/ui/home/HomeRewardsSection';
import { HomeSectionTitle } from '@components/ui/home/HomeSectionTitle';
import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { useCategoriesExplore } from '@hooks/useCategoriesExplore';
import { useAuthMe } from '@hooks/useAuthMe';
import { useAuthStore } from '@stores/authStore';
import {
  estimateLevelProgress,
  firstNameFromDisplay,
  formatJoursLabel,
  formatLevelCodeLabel,
  initialsFromName,
  levelProgressEndpoints,
} from '@utils/levelDisplay';

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

const LEADERBOARD: HomeLeaderboardUser[] = [
  { id: 'u-1', name: 'Awa', points: 1940, rank: 1 },
  { id: 'u-2', name: 'Moussa', points: 1760, rank: 2 },
  { id: 'u-3', name: 'Fatou', points: 1705, rank: 3 },
  { id: 'u-4', name: 'Abdou', points: 1640, rank: 4 },
];

export default function HomeRefactoredScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, Spacing.onboardingMaxWidth);
  const carouselRef = useRef<FlatList<HomeInsightItem> | null>(null);
  const [activeInsight, setActiveInsight] = useState(0);
  const glowAnim = useRef(new Animated.Value(0.35)).current;
  const token = useAuthStore((s) => s.token);
  const { data: me, loading: meLoading, refetch: refetchAuthMe } = useAuthMe();
  const { data: allCategories, loading: categoriesLoading } = useCategoriesExplore();

  useFocusEffect(
    useCallback(() => {
      void refetchAuthMe();
    }, [refetchAuthMe]),
  );

  const topThreeCategories = useMemo(() => allCategories.slice(0, 3), [allCategories]);

  const goToAllCategories = useCallback(() => {
    router.push(Routes.CATEGORIES);
  }, [router]);

  const goToCategory = useCallback(
    (categorySlug: string) => {
      router.push(`${Routes.CATEGORIES}/${categorySlug}`);
    },
    [router],
  );

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
    const display =
      profile?.full_name?.trim() ||
      (typeof meta?.full_name === 'string' ? meta.full_name.trim() : '') ||
      (typeof meta?.username === 'string' ? meta.username.trim() : '') ||
      '';
    const first = firstNameFromDisplay(display || 'Joueur');
    const initials = initialsFromName(display || first);
    const levelCode = profile?.level_code;
    const quizzesDone = profile?.quizzes_completed ?? 0;
    const progress = estimateLevelProgress(levelCode, quizzesDone);
    const { left, right } = levelProgressEndpoints(levelCode);
    const streak = profile?.streak_days ?? 0;
    const daysActive = profile?.days_active ?? 0;
    const clockLabel =
      streak > 0 ? formatJoursLabel(streak) : daysActive > 0 ? formatJoursLabel(daysActive) : '0 jour';

    const score = profile?.total_score ?? 0;
    const loadingPlaceholders = Boolean(token?.trim()) && meLoading;

    return {
      avatarInitial: initials,
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
          <HomeHeaderCard
            glowOpacity={glowAnim}
            progress={headerVm.progress}
            avatarInitial={headerVm.avatarInitial}
            displayNameWithEmoji={headerVm.displayNameWithEmoji}
            totalScoreDisplay={headerVm.totalScoreDisplay}
            levelLabel={headerVm.levelLabel}
            rankLabel={headerVm.rankLabel}
            streakOrDaysLabel={headerVm.streakOrDaysLabel}
            progressLabelLeft={headerVm.progressLabelLeft}
            progressLabelRight={headerVm.progressLabelRight}
          />

          <View style={styles.section}>
            <HomeSectionTitle title="Le savoir du jour" action="Voir tout" />
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

          <HomeActionTiles />

          <View style={styles.section}>
            <HomeSectionTitle title="Top classement" action="Voir complet" />
            <HomeLeaderboardSection users={LEADERBOARD} />
          </View>

          <View style={styles.section}>
            <HomeSectionTitle title="Voir mes récompenses" />
            <HomeRewardsSection />
          </View>
        </View>
      </ScrollView>

      <HomeBottomNav height={BOTTOM_NAV_HEIGHT} />
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
