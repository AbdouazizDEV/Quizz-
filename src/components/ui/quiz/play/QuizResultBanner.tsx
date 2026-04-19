import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { QuizPlayTheme } from '@constants/quizPlayTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

import type { QuizFeedbackPhase } from '@stores/quizPlaySessionStore';

interface QuizResultBannerProps {
  phase: Exclude<QuizFeedbackPhase, 'idle'>;
  title: string;
  chipLabel: string;
  fonts: ProfileFontFamilies;
}

export function QuizResultBanner({ phase, title, chipLabel, fonts }: QuizResultBannerProps) {
  const slide = useRef(new Animated.Value(-QuizPlayTheme.resultBannerHeight)).current;

  useEffect(() => {
    slide.setValue(-QuizPlayTheme.resultBannerHeight);
    Animated.spring(slide, {
      toValue: 0,
      friction: 7,
      tension: 65,
      useNativeDriver: true,
    }).start();
  }, [phase, slide]);

  const bg = phase === 'correct' ? QuizPlayTheme.success : QuizPlayTheme.error;

  return (
    <Animated.View style={[styles.wrap, { backgroundColor: bg, transform: [{ translateY: slide }] }]}>
      <View style={styles.decor1} />
      <View style={styles.decor2} />
      <View style={styles.decor3} />
      <View style={styles.content}>
        <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>{title}</Text>
        <View style={styles.chip}>
          <Text
            style={[
              styles.chipText,
              fonts.bold && { fontFamily: fonts.bold },
              { color: phase === 'correct' ? QuizPlayTheme.success : QuizPlayTheme.error },
            ]}
            numberOfLines={2}
          >
            {chipLabel}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: QuizPlayTheme.resultBannerHeight,
    zIndex: 20,
    overflow: 'hidden',
  },
  decor1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    opacity: 0.12,
    transform: [{ rotate: '18deg' }],
    top: -80,
    right: -40,
  },
  decor2: {
    position: 'absolute',
    width: 160,
    height: 160,
    backgroundColor: '#FFFFFF',
    opacity: 0.08,
    transform: [{ rotate: '-12deg' }],
    bottom: -50,
    left: -30,
  },
  decor3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    opacity: 0.1,
    top: 20,
    left: 40,
    transform: [{ rotate: '32deg' }],
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 16,
  },
  title: {
    fontSize: 24,
    lineHeight: 38,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 24,
    maxWidth: '100%',
  },
  chipText: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
});
