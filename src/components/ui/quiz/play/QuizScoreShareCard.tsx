import { Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import type { QuizLeaderboardEntry } from '@app-types/quizPlay.types';
import type { QuizScoreShareInput } from '@utils/quiz/buildQuizScoreShareMessage';

export const QUIZ_SCORE_SHARE_CARD_WIDTH = 360;

interface QuizScoreShareCardProps {
  input: QuizScoreShareInput;
  variant: 'max' | 'great' | 'default';
  fonts: { bold?: string; semiBold?: string; medium?: string };
}

function rankMedalColor(rank: number): string | null {
  if (rank === 1) return '#D4AF37';
  if (rank === 2) return '#9CA3AF';
  if (rank === 3) return '#CD7F32';
  return null;
}

function variantTitle(variant: QuizScoreShareCardProps['variant']): string {
  if (variant === 'max') return 'Score parfait !';
  if (variant === 'great') return 'Félicitations !';
  return 'Quiz terminé';
}

function rankLabel(rank: number): string {
  if (rank === 1) return '1er';
  if (rank === 2) return '2e';
  return `${rank}e`;
}

function ShareLeaderboardRow({
  entry,
  fonts,
}: {
  entry: QuizLeaderboardEntry;
  fonts: QuizScoreShareCardProps['fonts'];
}) {
  const medalColor = rankMedalColor(entry.rank);
  const highlighted = entry.isCurrentUser;

  return (
    <View style={[styles.lbRow, highlighted && styles.lbRowHighlight]}>
      <View style={styles.lbRank}>
        {medalColor ? (
          <Feather name="award" size={18} color={medalColor} />
        ) : (
          <Text style={[styles.lbRankNum, fonts.bold && { fontFamily: fonts.bold }]}>{entry.rank}</Text>
        )}
      </View>
      <View style={styles.lbAvatar}>
        {entry.avatarUrl ? (
          <Image source={{ uri: entry.avatarUrl }} style={styles.lbAvatarImg} />
        ) : (
          <Text style={[styles.lbAvatarLetter, fonts.bold && { fontFamily: fonts.bold }]}>
            {entry.displayName[0]?.toUpperCase() ?? '?'}
          </Text>
        )}
      </View>
      <Text
        style={[styles.lbName, highlighted && styles.lbNameHighlight, fonts.semiBold && { fontFamily: fonts.semiBold }]}
        numberOfLines={1}
      >
        {entry.displayName}
        {highlighted ? ' (toi)' : ''}
      </Text>
      <Text style={[styles.lbPts, highlighted && styles.lbPtsHighlight, fonts.bold && { fontFamily: fonts.bold }]}>
        {entry.score}
      </Text>
    </View>
  );
}

export function QuizScoreShareCard({ input, variant, fonts }: QuizScoreShareCardProps) {
  const me = input.leaderboard?.find((e) => e.isCurrentUser);
  const topRows = input.leaderboard?.slice(0, 5) ?? [];

  return (
    <View style={styles.wrap} collapsable={false}>
      <LinearGradient colors={['#FFE066', '#FFB703', '#F59E0B']} style={styles.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.blobA} />
        <View style={styles.blobB} />

        <View style={styles.inner}>
          <View style={styles.brandRow}>
            <Image source={require('../../../../../assets/icons/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={[styles.brand, fonts.bold && { fontFamily: fonts.bold }]}>Quizz+</Text>
          </View>

          <View style={styles.badge}>
            <Feather name="zap" size={14} color="#1F2261" />
            <Text style={[styles.badgeTxt, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
              {variantTitle(variant)}
            </Text>
          </View>

          <Text style={[styles.quizTitle, fonts.bold && { fontFamily: fonts.bold }]} numberOfLines={2}>
            {input.quizTitle}
          </Text>

          <View style={styles.scorePanel}>
            <Text style={[styles.scoreLabel, fonts.semiBold && { fontFamily: fonts.semiBold }]}>Ton score</Text>
            <Text style={[styles.scoreValue, fonts.bold && { fontFamily: fonts.bold }]}>{input.score}</Text>
            <Text style={[styles.scoreSub, fonts.medium && { fontFamily: fonts.medium }]}>
              {input.correctCount} / {input.total} bonnes réponses
            </Text>
            {me ? (
              <View style={styles.rankPill}>
                <Feather name="bar-chart-2" size={14} color="#1F2261" />
                <Text style={[styles.rankPillTxt, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
                  {rankLabel(me.rank)} sur ce quiz
                </Text>
              </View>
            ) : null}
          </View>

          {topRows.length > 0 ? (
            <View style={styles.lbBlock}>
              <Text style={[styles.lbTitle, fonts.bold && { fontFamily: fonts.bold }]}>Classement sur ce quiz</Text>
              {topRows.map((row) => (
                <ShareLeaderboardRow key={row.userId} entry={row} fonts={fonts} />
              ))}
            </View>
          ) : null}

          <Text style={[styles.footer, fonts.medium && { fontFamily: fonts.medium }]}>Rejoins-moi sur Quizz+</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: QUIZ_SCORE_SHARE_CARD_WIDTH,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  bg: {
    padding: 3,
    borderRadius: 28,
  },
  blobA: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.18)',
    top: -30,
    right: -20,
  },
  blobB: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(31,34,97,0.08)',
    bottom: 40,
    left: -20,
  },
  inner: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: { width: 28, height: 28 },
  brand: { fontSize: 18, fontWeight: '900', color: '#1F2261', letterSpacing: 0.3 },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF3D6',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  badgeTxt: { fontSize: 13, fontWeight: '700', color: '#1F2261' },
  quizTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#212121',
    lineHeight: 22,
  },
  scorePanel: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
    gap: 4,
  },
  scoreLabel: { fontSize: 13, color: '#616161', fontWeight: '600' },
  scoreValue: { fontSize: 52, fontWeight: '900', color: '#1F2261', lineHeight: 56 },
  scoreSub: { fontSize: 15, color: '#424242' },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: '#E8EEFF',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rankPillTxt: { fontSize: 13, fontWeight: '700', color: '#1F2261' },
  lbBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  lbTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2261',
    paddingHorizontal: 14,
    paddingBottom: 6,
    paddingTop: 4,
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEEEEE',
  },
  lbRowHighlight: { backgroundColor: '#FFF8E1' },
  lbRank: { width: 24, alignItems: 'center' },
  lbRankNum: { fontSize: 14, fontWeight: '800', color: '#424242' },
  lbAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lbAvatarImg: { width: '100%', height: '100%' },
  lbAvatarLetter: { fontSize: 14, fontWeight: '800', color: '#315ECC' },
  lbName: { flex: 1, fontSize: 14, color: '#212121', fontWeight: '600' },
  lbNameHighlight: { color: '#1F2261', fontWeight: '800' },
  lbPts: { fontSize: 15, fontWeight: '800', color: '#212121', minWidth: 36, textAlign: 'right' },
  lbPtsHighlight: { color: '#FFB703' },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
});
