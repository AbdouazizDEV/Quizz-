import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisRoutes } from '@constants/defisRoutes';
import { Routes } from '@constants/Routes';
import { COLORS } from '@constants/Colors';
import { useAuthMe } from '@hooks/useAuthMe';
import { fetchDuelById } from '@services/defis/duelRepository';

export default function DuelResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const duelId = typeof id === 'string' ? id : '';
  const router = useRouter();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';

  const { data: duel, isLoading } = useQuery({
    queryKey: ['duel', duelId],
    queryFn: () => fetchDuelById(duelId),
    enabled: Boolean(duelId),
  });

  const isResultReady =
    duel &&
    (duel.status === 'completed' ||
      duel.status === 'declined' ||
      (duel.challengerScore !== null && duel.challengedScore !== null));

  if (isLoading || !duel || !isResultReady) {
    return (
      <DefisPageShell title="Résultat">
        <ActivityIndicator color={COLORS.primary} />
      </DefisPageShell>
    );
  }

  const isChallenger = duel.challengerId === userId;
  const myScore = isChallenger ? duel.challengerScore ?? 0 : duel.challengedScore ?? 0;
  const opponentScore = isChallenger ? duel.challengedScore ?? 0 : duel.challengerScore ?? 0;
  const opponentName = isChallenger ? duel.challengedName : duel.challengerName;
  const won =
    duel.winnerId === userId ||
    (duel.winnerId === null && myScore > opponentScore);

  return (
    <DefisPageShell title="Résultat">
      <Text style={styles.headline}>{won ? '🎉 Victoire !' : 'Bien joué, continuez !'}</Text>

      <View style={styles.scoresRow}>
        <ScoreColumn label="Vous" score={myScore} highlight={won} />
        <Text style={styles.vs}>VS</Text>
        <ScoreColumn label={opponentName} score={opponentScore} highlight={!won} />
      </View>

      <Text style={[styles.points, won ? styles.pointsWin : styles.pointsLoss]}>
        {won ? '+15 pts gagnés' : '+5 pts pour la participation'}
      </Text>

      {!won ? (
        <Text style={styles.encourage}>
          {opponentName} n&apos;était qu&apos;à {Math.max(1, opponentScore - myScore)} pts devant vous !
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={() => router.push(DefisRoutes.duelHub)}>
          <Text style={styles.primaryBtnText}>Revanche →</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => router.replace(Routes.HOME)}>
          <Text style={styles.secondaryBtnText}>Accueil</Text>
        </Pressable>
      </View>
    </DefisPageShell>
  );
}

function ScoreColumn({
  label,
  score,
  highlight,
}: {
  label: string;
  score: number;
  highlight: boolean;
}) {
  return (
    <View style={styles.scoreCol}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={[styles.scoreBox, highlight && styles.scoreBoxHighlight]}>
        <Text style={[styles.scoreValue, highlight && styles.scoreValueHighlight]}>{score}</Text>
        <Text style={styles.scoreUnit}>pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontFamily: 'Nunito_900Black',
    fontSize: 26,
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 16,
  },
  scoreCol: { alignItems: 'center', gap: 8, flex: 1 },
  scoreLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  scoreBox: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    minWidth: 100,
  },
  scoreBoxHighlight: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  scoreValue: {
    fontFamily: 'Nunito_900Black',
    fontSize: 32,
    color: COLORS.textSecondary,
  },
  scoreValueHighlight: {
    color: COLORS.primary,
  },
  scoreUnit: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  vs: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  points: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  pointsWin: { color: COLORS.success },
  pointsLoss: { color: COLORS.textSecondary },
  encourage: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textLight,
    fontSize: 14,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
