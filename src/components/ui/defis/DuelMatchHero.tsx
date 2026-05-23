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
  opponentName: string;
  opponentUserId: string;
  myScore: number | null;
  showOpponentScore: boolean;
  opponentScore: number | null;
  questionsCount: number;
  expiresAt: string;
  statusLabel: string;
  motivationalLine: string;
}

export function DuelMatchHero({
  myName,
  myUserId,
  myAvatarUrl,
  opponentName,
  opponentUserId,
  myScore,
  showOpponentScore,
  opponentScore,
  questionsCount,
  expiresAt,
  statusLabel,
  motivationalLine,
}: DuelMatchHeroProps) {
  return (
    <Animated.View entering={FadeInDown.duration(450)}>
      <LinearGradient
        colors={[COLORS.primaryLight, '#FFE8A3', COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.badgeRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>⚡ {statusLabel}</Text>
          </View>
        </View>

        <Text style={styles.motivation}>{motivationalLine}</Text>

        <View style={styles.versusRow}>
          <PlayerColumn
            label="Vous"
            name={myName}
            avatarUri={getUserAvatarUri(myUserId, myAvatarUrl)}
            score={myScore}
            highlight
          />
          <View style={styles.vsBubble}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <PlayerColumn
            label={opponentName.split(' ')[0]}
            name={opponentName}
            avatarUri={getUserAvatarUri(opponentUserId, null)}
            score={showOpponentScore ? opponentScore : null}
            locked={!showOpponentScore}
          />
        </View>

        <View style={styles.statsRow}>
          <StatChip icon="📋" label={`${questionsCount} questions`} />
          <StatChip icon="⏱" label="~3 min" />
          <StatChip icon="🏆" label="+15 pts max" />
        </View>

        <View style={styles.countdownWrap}>
          <CountdownTimer endsAt={expiresAt} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function PlayerColumn({
  label,
  name,
  avatarUri,
  score,
  highlight = false,
  locked = false,
}: {
  label: string;
  name: string;
  avatarUri: string;
  score: number | null;
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
      {locked ? (
        <View style={styles.scoreLocked}>
          <Text style={styles.scoreLockedText}>🔒 Secret</Text>
        </View>
      ) : score !== null ? (
        <Text style={[styles.playerScore, highlight && styles.playerScoreHighlight]}>{score} pts</Text>
      ) : (
        <Text style={styles.scorePending}>À jouer</Text>
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
  badgeRow: {
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
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
    alignItems: 'center',
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
  playerScore: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  playerScoreHighlight: {
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
  },
});
