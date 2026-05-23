import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { CountdownTimer } from '@components/atoms/CountdownTimer';
import { COLORS } from '@constants/Colors';
import { getUserAvatarUri } from '@utils/getUserAvatarUri';

interface DuelMatchHeroProps {
  myName: string;
  myUserId: string;
  myAvatarUrl?: string | null;
  myTotalScore: number;
  opponentName: string;
  opponentUserId: string;
  opponentAvatarUrl?: string | null;
  opponentTotalScore: number;
  myQuizScore: number | null;
  showOpponentQuizScore: boolean;
  opponentQuizScore: number | null;
  questionsCount: number;
  expiresAt: string;
  isExpired: boolean;
  statusLabel: string;
  motivationalLine: string;
}

export function DuelMatchHero({
  myName,
  myUserId,
  myAvatarUrl,
  myTotalScore,
  opponentName,
  opponentUserId,
  opponentAvatarUrl,
  opponentTotalScore,
  myQuizScore,
  showOpponentQuizScore,
  opponentQuizScore,
  questionsCount,
  expiresAt,
  isExpired,
  statusLabel,
  motivationalLine,
}: DuelMatchHeroProps) {
  return (
    <Animated.View entering={FadeInDown.duration(450)}>
      <LinearGradient
        colors={
          isExpired
            ? ['#FFF0F0', '#FFE4E4', '#FFF5F5']
            : [COLORS.primaryLight, '#FFE8A3', COLORS.primaryLight]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, isExpired && styles.heroExpired]}
      >
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, isExpired && styles.statusBadgeExpired]}>
            <Text style={styles.statusText}>
              {isExpired ? '⏱ Expiré' : `⚡ ${statusLabel}`}
            </Text>
          </View>
        </View>

        <Text style={styles.motivation}>{motivationalLine}</Text>

        <View style={styles.versusRow}>
          <PlayerColumn
            label="Vous"
            name={myName}
            avatarUri={getUserAvatarUri(myUserId, myAvatarUrl)}
            totalScore={myTotalScore}
            quizScore={myQuizScore}
            highlight
          />
          <View style={styles.vsBubble}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <PlayerColumn
            label={opponentName.split(' ')[0]}
            name={opponentName}
            avatarUri={getUserAvatarUri(opponentUserId, opponentAvatarUrl)}
            totalScore={opponentTotalScore}
            quizScore={showOpponentQuizScore ? opponentQuizScore : null}
            locked={!showOpponentQuizScore && opponentQuizScore === null}
          />
        </View>

        <View style={styles.statsRow}>
          <StatChip icon="📋" label={`${questionsCount} questions`} />
          <StatChip icon="🏆" label="Score classement" />
          <StatChip icon="⭐" label="Points quiz du duel" />
        </View>

        <View style={styles.countdownWrap}>
          <CountdownTimer endsAt={expiresAt} />
          {isExpired ? (
            <Text style={styles.expiredHint}>
              Ce défi n&apos;est plus disponible. Consultez « Mes duels récents ».
            </Text>
          ) : null}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function PlayerColumn({
  label,
  name,
  avatarUri,
  totalScore,
  quizScore,
  highlight = false,
  locked = false,
}: {
  label: string;
  name: string;
  avatarUri: string;
  totalScore: number;
  quizScore: number | null;
  highlight?: boolean;
  locked?: boolean;
}) {
  return (
    <View style={styles.playerCol}>
      <View style={[styles.avatarRing, highlight && styles.avatarRingHighlight]}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
      </View>
      <Text style={styles.playerLabel}>{label}</Text>
      <Text style={styles.playerName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.totalScoreLine}>{totalScore} pts classement</Text>
      {locked ? (
        <View style={styles.scoreLocked}>
          <Text style={styles.scoreLockedText}>🔒 Quiz secret</Text>
        </View>
      ) : quizScore !== null ? (
        <Text style={[styles.quizScoreLine, highlight && styles.quizScoreHighlight]}>
          {quizScore} pts quiz
        </Text>
      ) : (
        <Text style={styles.scorePending}>Quiz · à jouer</Text>
      )}
    </View>
  );
}

function StatChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>
        {icon} {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  heroExpired: {
    borderColor: COLORS.error,
  },
  badgeRow: {
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statusBadgeExpired: {
    backgroundColor: COLORS.error,
  },
  statusText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  motivation: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    lineHeight: 24,
    color: COLORS.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  versusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  vsBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  vsText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 16,
    color: COLORS.primaryDark,
  },
  playerCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  avatarRingHighlight: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.border,
  },
  playerLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playerName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.textPrimary,
    maxWidth: 110,
    textAlign: 'center',
  },
  totalScoreLine: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  quizScoreLine: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  quizScoreHighlight: {
    color: COLORS.primary,
  },
  scorePending: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.info,
  },
  scoreLocked: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  scoreLockedText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.35)',
  },
  chipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  countdownWrap: {
    alignItems: 'center',
    gap: 6,
  },
  expiredHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.error,
    textAlign: 'center',
    lineHeight: 18,
  },
});
