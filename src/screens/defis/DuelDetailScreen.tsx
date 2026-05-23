import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { COLORS } from '@constants/Colors';
import { buildQuizEntryHref } from '@constants/Routes';
import { useAuthMe } from '@hooks/useAuthMe';
import { fetchDuelById } from '@services/defis/duelRepository';

export default function DuelDetailScreen() {
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

  if (isLoading || !duel) {
    return (
      <DefisPageShell title="Duel">
        <ActivityIndicator color={COLORS.primary} />
      </DefisPageShell>
    );
  }

  const isChallenger = duel.challengerId === userId;
  const isChallenged = duel.challengedId === userId;
  const myScore = isChallenger ? duel.challengerScore : duel.challengedScore;
  const opponentScore = isChallenger ? duel.challengedScore : duel.challengerScore;
  const opponentName = isChallenger ? duel.challengedName : duel.challengerName;

  const canChallengerPlay =
    isChallenger && (duel.status === 'pending' || duel.status === 'accepted') && myScore === null;
  const canChallengedPlay =
    isChallenged && duel.status === 'accepted' && myScore === null;

  const waitingForAccept = isChallenger && duel.status === 'pending' && myScore !== null;
  const waitingForOpponent = isChallenger && duel.status === 'accepted' && opponentScore === null;

  return (
    <DefisPageShell title="Duel">
      <Text style={styles.title}>Vous vs {opponentName}</Text>
      <Text style={styles.meta}>{duel.questionsCount} questions</Text>

      {duel.status === 'declined' ? (
        <Text style={styles.hint}>Ce défi a été refusé.</Text>
      ) : null}

      {myScore !== null ? (
        <Text style={styles.score}>Votre score : {myScore} pts</Text>
      ) : null}

      {opponentScore !== null && duel.status === 'completed' ? (
        <Text style={styles.scoreMuted}>Score adverse : {opponentScore} pts</Text>
      ) : (
        <Text style={styles.hint}>
          Le score de l&apos;adversaire sera visible une fois la partie terminée.
        </Text>
      )}

      {waitingForAccept ? (
        <Text style={styles.hint}>En attente que {opponentName} accepte votre défi…</Text>
      ) : null}

      {waitingForOpponent ? (
        <Text style={styles.hint}>En attente que {opponentName} joue sa partie…</Text>
      ) : null}

      {(canChallengerPlay || canChallengedPlay) && duel.quizId ? (
        <Pressable
          style={styles.primaryBtn}
          onPress={() => router.push(buildQuizEntryHref(duel.quizId))}
        >
          <Text style={styles.primaryBtnText}>Jouer mes questions →</Text>
        </Pressable>
      ) : null}
    </DefisPageShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  meta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  score: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: COLORS.primary,
  },
  scoreMuted: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  hint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textLight,
    fontSize: 15,
  },
});
