import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeActionTiles } from '@components/ui/home/HomeActionTiles';
import { HomeBottomNav } from '@components/ui/home/HomeBottomNav';
import { HomeDailyQuizSection, type HomeQuizItem } from '@components/ui/home/HomeDailyQuizSection';
import { HomeHeaderCard } from '@components/ui/home/HomeHeaderCard';
import { HomeInsightCarousel, type HomeInsightItem } from '@components/ui/home/HomeInsightCarousel';
import {
  HomeLeaderboardSection,
  type HomeLeaderboardUser,
} from '@components/ui/home/HomeLeaderboardSection';
import { HomeRewardsSection } from '@components/ui/home/HomeRewardsSection';
import { HomeSectionTitle } from '@components/ui/home/HomeSectionTitle';
import { Spacing } from '@constants/Spacing';

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

const DAILY_QUIZZES: HomeQuizItem[] = [
  { id: 'q-1', title: 'Culture Generale Express', questions: 12, difficulty: 'Moyen', icon: 'zap' },
  { id: 'q-2', title: 'Histoire Moderne', questions: 8, difficulty: 'Difficile', icon: 'book-open' },
  { id: 'q-3', title: 'Sciences & Tech', questions: 10, difficulty: 'Moyen', icon: 'cpu' },
];

const LEADERBOARD: HomeLeaderboardUser[] = [
  { id: 'u-1', avatar: 'https://via.placeholder.com/150', name: 'Awa', points: 1940, rank: 1 },
  { id: 'u-2', avatar: 'https://via.placeholder.com/150', name: 'Moussa', points: 1760, rank: 2 },
  { id: 'u-3', avatar: 'https://via.placeholder.com/150', name: 'Fatou', points: 1705, rank: 3 },
  { id: 'u-4', avatar: 'https://via.placeholder.com/150', name: 'Abdou', points: 1640, rank: 4 },
];

export default function HomeRefactoredScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, Spacing.onboardingMaxWidth);
  const carouselRef = useRef<FlatList<HomeInsightItem> | null>(null);
  const [activeInsight, setActiveInsight] = useState(0);
  const glowAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.85, duration: 1400, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.35, duration: 1400, useNativeDriver: true }),
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

  const progress = useMemo(() => Math.min(1, 0.46), []);

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
          <HomeHeaderCard glowOpacity={glowAnim} progress={progress} />

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
            <HomeSectionTitle title="Quizz du jour" action="Nouveaux" />
            <HomeDailyQuizSection quizzes={DAILY_QUIZZES} />
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
