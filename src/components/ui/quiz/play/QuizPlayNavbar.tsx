import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { QuizPlayTheme } from '@constants/quizPlayTheme';

import { QuizTimerBar } from '@components/ui/quiz/play/QuizTimerBar';
import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface QuizPlayNavbarProps {
  current: number;
  total: number;
  /** Score courant (points cumulés sur les bonnes réponses). */
  sessionPoints: number;
  /** Maximum atteignable sur cette session (questions × pts par question). */
  maxSessionPoints?: number;
  timerSeconds: number;
  timerMax: number;
  fonts: ProfileFontFamilies;
  onMenuPress?: () => void;
}

export function QuizPlayNavbar({
  current,
  total,
  sessionPoints,
  maxSessionPoints,
  timerSeconds,
  timerMax,
  fonts,
  onMenuPress,
}: QuizPlayNavbarProps) {
  const progress = timerMax > 0 ? Math.max(0, Math.min(1, timerSeconds / timerMax)) : 0;

  return (
    <View style={styles.outer}>
      <View style={styles.row}>
        <Text style={[styles.progressText, fonts.bold && { fontFamily: fonts.bold }]}>
          {current}/{total}
        </Text>
        <View style={styles.centerBlock}>
          <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>Quiz</Text>
          <Text style={[styles.score, fonts.bold && { fontFamily: fonts.bold }]}>
            {maxSessionPoints !== undefined
              ? `${sessionPoints} / ${maxSessionPoints} pts`
              : `${sessionPoints} pts`}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onMenuPress} style={styles.iconBtn}>
          <Feather name="more-horizontal" size={22} color={QuizPlayTheme.grey900} />
        </Pressable>
      </View>
      <QuizTimerBar
        progress={progress}
        timeLeft={timerSeconds}
        duration={timerMax}
        fontFamily={fonts.bold}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 16,
    minHeight: 48,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: QuizPlayTheme.grey900,
    minWidth: 40,
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: QuizPlayTheme.grey900,
  },
  score: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C9A000',
    marginTop: 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
