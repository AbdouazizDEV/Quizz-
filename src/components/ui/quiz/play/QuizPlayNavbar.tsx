import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { QuizPlayTheme } from '@constants/quizPlayTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface QuizPlayNavbarProps {
  current: number;
  total: number;
  /** Score courant (points cumulés sur les bonnes réponses). */
  sessionPoints: number;
  timerSeconds: number;
  timerMax: number;
  fonts: ProfileFontFamilies;
  onMenuPress?: () => void;
}

export function QuizPlayNavbar({
  current,
  total,
  sessionPoints,
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
          <Text style={[styles.score, fonts.bold && { fontFamily: fonts.bold }]}>{sessionPoints} pts</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onMenuPress} style={styles.iconBtn}>
          <Feather name="more-horizontal" size={22} color={QuizPlayTheme.grey900} />
        </Pressable>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        <View style={styles.pill}>
          <Text style={[styles.pillText, fonts.bold && { fontFamily: fonts.bold }]}>{timerSeconds}</Text>
        </View>
      </View>
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
  track: {
    height: 14,
    borderRadius: 100,
    backgroundColor: '#E8E8E8',
    overflow: 'visible',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFD700',
    borderRadius: 100,
  },
  pill: {
    position: 'absolute',
    right: 4,
    top: -6,
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
    color: QuizPlayTheme.grey900,
  },
});
