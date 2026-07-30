import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import type { ProfileStatItem } from '@app-types/profile.types';
import { ProfileTheme } from '@constants/profileTheme';
import { Routes } from '@constants/Routes';
import type { LevelProgressDetail } from '@utils/levelDisplay';

import type { ProfileFontFamilies } from './ProfileFonts';
import { ProfileCircularPerformance } from './ProfileCircularPerformance';

const AUTO_INTERVAL_MS = 5000;
const SLIDE_IDS = ['progression', 'statistiques', 'badges', 'premium'] as const;
type SlideId = (typeof SLIDE_IDS)[number];

interface ProfileInsightsCarouselProps {
  progress: LevelProgressDetail;
  stats: ProfileStatItem[];
  quizzesCompleted: number;
  streakDays: number;
  isPremium: boolean;
  premiumDaysLeft?: number;
  fonts: ProfileFontFamilies;
}

function SlideChrome({
  icon,
  title,
  children,
  fonts,
}: {
  icon: ComponentProps<typeof Feather>['name'];
  title: string;
  children: ReactNode;
  fonts: ProfileFontFamilies;
}) {
  return (
    <LinearGradient colors={['#FFFFFF', '#FFFBF0']} style={styles.slide}>
      <View style={styles.slideHeader}>
        <View style={styles.iconBubble}>
          <Feather name={icon} size={16} color="#1F2261" />
        </View>
        <Text style={[styles.slideTitle, fonts.bold && { fontFamily: fonts.bold }]}>{title}</Text>
      </View>
      {children}
    </LinearGradient>
  );
}

export function ProfileInsightsCarousel({
  progress,
  stats,
  quizzesCompleted,
  streakDays,
  isPremium,
  premiumDaysLeft = 0,
  fonts,
}: ProfileInsightsCarouselProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const pausedRef = useRef(false);
  const indexRef = useRef(0);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((next: number) => {
    const clamped = ((next % SLIDE_IDS.length) + SLIDE_IDS.length) % SLIDE_IDS.length;
    indexRef.current = clamped;
    setIndex(clamped);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      goTo(indexRef.current + 1);
    }, AUTO_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [goTo]);

  const onViewportLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.floor(e.nativeEvent.layout.width);
    if (w > 0 && w !== viewportWidth) setViewportWidth(w);
  }, [viewportWidth]);

  const quizCount = stats.find((s) => s.id === 'quizzo')?.valueLabel ?? String(quizzesCompleted);
  const plays = stats.find((s) => s.id === 'plays')?.valueLabel ?? '0';
  const followers = stats.find((s) => s.id === 'followers')?.valueLabel ?? '0';

  const performanceRatio = useMemo(() => {
    const q = Number(quizzesCompleted) || 0;
    if (q <= 0) return 0.42;
    return Math.min(0.96, 0.45 + Math.min(q, 40) / 80 + Math.min(streakDays, 14) / 50);
  }, [quizzesCompleted, streakDays]);

  const barPct = Math.min(100, Math.max(0, progress.percent));

  const slides: { id: SlideId; node: ReactNode }[] = [
    {
      id: 'progression',
      node: (
        <SlideChrome icon="bookmark" title="Progression" fonts={fonts}>
          <Text style={[styles.levelLine, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
            Niveau {progress.levelNumber}
            {progress.nextLevelNumber ? ` → Niveau ${progress.nextLevelNumber}` : ' · Max'}
          </Text>
          <Text style={[styles.remaining, fonts.bold && { fontFamily: fonts.bold }]}>
            {progress.remainingLabel}
          </Text>
          <View style={styles.barRow}>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${barPct}%` }]} />
            </View>
            <Text style={[styles.percent, fonts.bold && { fontFamily: fonts.bold }]}>
              {progress.percent}%
            </Text>
          </View>
        </SlideChrome>
      ),
    },
    {
      id: 'statistiques',
      node: (
        <SlideChrome icon="message-square" title="Statistiques" fonts={fonts}>
          <View style={styles.statsRow}>
            <ProfileCircularPerformance
              ratio={performanceRatio}
              label="Perf."
              fonts={fonts}
              size={88}
            />
            <View style={styles.statsList}>
              <Text style={[styles.statLine, fonts.medium && { fontFamily: fonts.medium }]}>
                Quiz joués : <Text style={styles.statStrong}>{quizCount}</Text>
              </Text>
              <Text style={[styles.statLine, fonts.medium && { fontFamily: fonts.medium }]}>
                Parties : <Text style={styles.statStrong}>{plays}</Text>
              </Text>
              <Text style={[styles.statLine, fonts.medium && { fontFamily: fonts.medium }]}>
                Série : <Text style={styles.statStrong}>{streakDays} j</Text>
              </Text>
              <Text style={[styles.statLine, fonts.medium && { fontFamily: fonts.medium }]}>
                Abonnés : <Text style={styles.statStrong}>{followers}</Text>
              </Text>
            </View>
          </View>
        </SlideChrome>
      ),
    },
    {
      id: 'badges',
      node: (
        <SlideChrome icon="award" title="Badges" fonts={fonts}>
          <Text style={[styles.badgesLine, fonts.medium && { fontFamily: fonts.medium }]}>
            Curieux du jour · Série {Math.max(streakDays, 1)} jours · Top 10 hebdo
          </Text>
          <Pressable
            style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.88 }]}
            onPress={() => router.push(Routes.STATISTICS)}
          >
            <Text style={[styles.outlineBtnText, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
              Voir mes badges
            </Text>
          </Pressable>
        </SlideChrome>
      ),
    },
    {
      id: 'premium',
      node: (
        <SlideChrome icon="star" title="Essai premium" fonts={fonts}>
          <Text style={[styles.premiumStatus, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
            {isPremium
              ? `Actif${premiumDaysLeft > 0 ? ` · ${premiumDaysLeft} jours restants` : ''}`
              : 'Non activé · Débloquez plus de quiz'}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.88 }]}
            onPress={() => router.push(Routes.PREMIUM)}
          >
            <Text style={[styles.outlineBtnText, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
              Voir les avantages
            </Text>
          </Pressable>
        </SlideChrome>
      ),
    },
  ];

  return (
    <View style={styles.root}>
      <View
        style={styles.viewport}
        onLayout={onViewportLayout}
        onTouchStart={(e) => {
          pausedRef.current = true;
          touchStartX.current = e.nativeEvent.pageX;
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          pausedRef.current = false;
          if (start == null) return;
          const dx = e.nativeEvent.pageX - start;
          if (Math.abs(dx) < 40) return;
          goTo(indexRef.current + (dx < 0 ? 1 : -1));
        }}
      >
        {viewportWidth > 0 ? (
          <View
            style={[
              styles.track,
              {
                width: viewportWidth * slides.length,
                transform: [{ translateX: -index * viewportWidth }],
              },
            ]}
          >
            {slides.map((slide) => (
              <View key={slide.id} style={{ width: viewportWidth }}>
                {slide.node}
              </View>
            ))}
          </View>
        ) : (
          <View style={{ width: '100%' }}>{slides[0]?.node}</View>
        )}
      </View>
      <View style={styles.dots}>
        {slides.map((slide, i) => (
          <Pressable key={slide.id} onPress={() => goTo(i)} hitSlop={8}>
            <View style={[styles.dot, i === index && styles.dotActive]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', gap: 12 },
  viewport: {
    width: '100%',
    overflow: 'hidden',
    minHeight: 168,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  slide: {
    marginHorizontal: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0E6B8',
    padding: 16,
    minHeight: 160,
    gap: 12,
    shadowColor: '#C9A000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  slideHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 183, 3, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: { fontSize: 16, fontWeight: '800', color: ProfileTheme.grey900 },
  levelLine: { fontSize: 15, color: ProfileTheme.grey800 },
  remaining: { fontSize: 18, color: '#C9A000', fontWeight: '800' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 99,
    backgroundColor: '#E8E8E8',
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    borderRadius: 99,
    backgroundColor: '#FFB703',
    minWidth: 2,
  },
  percent: { fontSize: 14, fontWeight: '800', color: ProfileTheme.grey900, minWidth: 40 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  statsList: { flex: 1, gap: 4 },
  statLine: { fontSize: 13, color: ProfileTheme.grey700 },
  statStrong: { fontWeight: '800', color: ProfileTheme.grey900 },
  badgesLine: { fontSize: 14, lineHeight: 21, color: ProfileTheme.grey700 },
  premiumStatus: { fontSize: 15, color: ProfileTheme.grey800 },
  outlineBtn: {
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: '#FFB703',
    borderRadius: 100,
    paddingVertical: 11,
    alignItems: 'center',
  },
  outlineBtnText: { fontSize: 14, fontWeight: '700', color: '#1F2261' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#FFB703',
  },
});
