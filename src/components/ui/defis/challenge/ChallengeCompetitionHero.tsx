import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CountdownTimer } from '@components/atoms/CountdownTimer';
import { CHALLENGE_UI } from '@constants/challengeUiTheme';
import { COLORS } from '@constants/Colors';

interface ChallengeCompetitionHeroProps {
  title: string;
  endsAt: string;
  rewardText?: string | null;
  userRank?: number | null;
  userScore?: number;
  quizzesPlayed?: number;
  totalQuizzes?: number;
}

export function ChallengeCompetitionHero({
  title,
  endsAt,
  rewardText,
  userRank,
  userScore = 0,
  quizzesPlayed = 0,
  totalQuizzes = 0,
}: ChallengeCompetitionHeroProps) {
  const progressPct = totalQuizzes > 0 ? Math.round((quizzesPlayed / totalQuizzes) * 100) : 0;

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <LinearGradient
        colors={[...CHALLENGE_UI.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.outer}
      >
        <View style={styles.inner}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Feather name="zap" size={14} color={CHALLENGE_UI.navy} />
              <Text style={styles.badgeText}>Challenge actif</Text>
            </View>
            {userRank != null && userRank > 0 ? (
              <View style={styles.rankPill}>
                <Feather name="award" size={13} color={CHALLENGE_UI.navy} />
                <Text style={styles.rankPillText}>#{userRank}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.title}>{title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <CountdownTimer endsAt={endsAt} showPrefix style={styles.countdown} />
            </View>
            {rewardText ? (
              <View style={styles.metaChip}>
                <Feather name="gift" size={14} color={CHALLENGE_UI.navy} />
                <Text style={styles.metaChipText} numberOfLines={1}>
                  {rewardText}
                </Text>
              </View>
            ) : null}
          </View>

          {totalQuizzes > 0 ? (
            <View style={styles.progressBlock}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progression</Text>
                <Text style={styles.progressValue}>
                  {quizzesPlayed}/{totalQuizzes} quiz · {userScore} pts
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.max(4, progressPct)}%` }]} />
              </View>
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: 22, padding: 3 },
  inner: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 19,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: CHALLENGE_UI.heroBorder,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  badgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: CHALLENGE_UI.navy,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: CHALLENGE_UI.gold,
  },
  rankPillText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: CHALLENGE_UI.navy,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 26,
    color: CHALLENGE_UI.navy,
    lineHeight: 32,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    maxWidth: '100%',
  },
  metaChipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: COLORS.textSecondary,
    flexShrink: 1,
  },
  countdown: { fontSize: 12, color: COLORS.textSecondary },
  progressBlock: { gap: 8, marginTop: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  progressLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  progressValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: CHALLENGE_UI.navy,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: CHALLENGE_UI.gold,
  },
});
