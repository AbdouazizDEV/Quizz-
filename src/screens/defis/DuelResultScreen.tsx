import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { DuelMatchHero } from '@components/ui/defis/DuelMatchHero';
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
      duel.status === 'expired' ||
      duel.isExpired ||
      (duel.challengerScore !== null && duel.challengedScore !== null));

  if (isLoading || !duel || !isResultReady) {
    return (
      <DefisPageShell title="Résultat">
        <ActivityIndicator color={COLORS.primary} />
      </DefisPageShell>
    );
  }

  const isChallenger = duel.challengerId === userId;
  const myQuizScore = isChallenger ? duel.challengerScore ?? 0 : duel.challengedScore ?? 0;
  const opponentQuizScore = isChallenger ? duel.challengedScore ?? 0 : duel.challengerScore ?? 0;
  const opponentName = isChallenger ? duel.challengedName : duel.challengerName;
  const opponentUserId = isChallenger ? duel.challengedId : duel.challengerId;
  const myName =
    authMe?.profile?.full_name?.trim() ||
    authMe?.profile?.username?.trim() ||
    'Vous';

  const expired = duel.isExpired || duel.status === 'expired';
  const won =
    !expired &&
    (duel.winnerId === userId || (duel.winnerId === null && myQuizScore > opponentQuizScore));

  const headline = expired
    ? '⏱ Duel expiré'
    : duel.status === 'declined'
      ? 'Défi refusé'
      : won
        ? '🎉 Victoire !'
        : 'Bien joué !';

  const subline = expired
    ? isChallenger
      ? duel.challengerScore === null
        ? 'Vous n\'avez pas joué à temps.'
        : 'L\'adversaire n\'a pas terminé à temps.'
      : duel.challengedScore === null
        ? 'Vous n\'avez pas joué à temps.'
        : 'Le délai est dépassé.'
    : won
      ? '+15 pts de récompense'
      : '+5 pts pour la participation';

  return (
    <DefisPageShell title="Résultat">
      <Animated.View entering={FadeInDown.duration(400)} style={styles.headlineWrap}>
        <Text style={[styles.headline, expired && styles.headlineExpired]}>{headline}</Text>
        <Text style={styles.subline}>{subline}</Text>
      </Animated.View>

      <DuelMatchHero
        myName={myName}
        myUserId={userId}
        myAvatarUrl={
          (isChallenger ? duel.challengerAvatarUrl : duel.challengedAvatarUrl) ??
          authMe?.profile?.avatar_url
        }
        myTotalScore={isChallenger ? duel.challengerTotalScore : duel.challengedTotalScore}
        opponentName={opponentName}
        opponentUserId={opponentUserId}
        opponentAvatarUrl={isChallenger ? duel.challengedAvatarUrl : duel.challengerAvatarUrl}
        opponentTotalScore={isChallenger ? duel.challengedTotalScore : duel.challengerTotalScore}
        myQuizScore={isChallenger ? duel.challengerScore : duel.challengedScore}
        showOpponentQuizScore
        opponentQuizScore={isChallenger ? duel.challengedScore : duel.challengerScore}
        questionsCount={duel.questionsCount}
        expiresAt={duel.expiresAt}
        isExpired={expired}
        statusLabel={expired ? 'Expiré' : won ? 'Victoire' : 'Résultat'}
        motivationalLine={
          expired
            ? 'Ce duel est archivé dans vos duels récents.'
            : `Score quiz : ${myQuizScore} vs ${opponentQuizScore}`
        }
      />

      {!expired && !won && opponentQuizScore > myQuizScore ? (
        <Text style={styles.encourage}>
          {opponentName} n&apos;était qu&apos;à {opponentQuizScore - myQuizScore} pt
          {opponentQuizScore - myQuizScore > 1 ? 's' : ''} devant vous !
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={() => router.push(DefisRoutes.duelHub)}>
          <Text style={styles.primaryBtnText}>Nouveau duel →</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => router.replace(Routes.HOME)}>
          <Text style={styles.secondaryBtnText}>Accueil</Text>
        </Pressable>
      </View>
    </DefisPageShell>
  );
}

const styles = StyleSheet.create({
  headlineWrap: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  headline: {
    fontFamily: 'Nunito_900Black',
    fontSize: 26,
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  headlineExpired: {
    color: COLORS.error,
  },
  subline: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  encourage: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.textLight,
    fontSize: 14,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
