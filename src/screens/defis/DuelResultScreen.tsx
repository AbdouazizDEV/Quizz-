import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { DuelMatchHero } from '@components/ui/defis/DuelMatchHero';
import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisRoutes } from '@constants/defisRoutes';
import { Routes } from '@constants/Routes';
import { COLORS } from '@constants/Colors';
import { isDuelResultReady, useDuelQuery } from '@hooks/defis/useDuelQuery';
import { useAuthMe } from '@hooks/useAuthMe';
import { resolveRouteParamId } from '@utils/resolveRouteParamId';

const enteringAnimation = Platform.OS === 'web' ? undefined : FadeInDown.duration(400);

export default function DuelResultScreen() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const duelId = resolveRouteParamId(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';

  const { data: duel, isPending, isFetching, isError, error } = useDuelQuery(duelId);

  const showInitialLoader = Boolean(duelId) && isPending && !duel;

  if (!duelId) {
    return (
      <DefisPageShell title="Résultat">
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Lien invalide</Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.push(DefisRoutes.duelHub)}>
            <Text style={styles.primaryBtnText}>Retour aux duels</Text>
          </Pressable>
        </View>
      </DefisPageShell>
    );
  }

  if (showInitialLoader) {
    return (
      <DefisPageShell title="Résultat">
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loaderText}>Chargement du résultat…</Text>
        </View>
      </DefisPageShell>
    );
  }

  if (isError || !duel) {
    return (
      <DefisPageShell title="Résultat">
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Résultat indisponible</Text>
          <Text style={styles.emptyBody}>
            {error instanceof Error ? error.message : 'Impossible de charger ce duel.'}
          </Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => {
              void queryClient.invalidateQueries({ queryKey: ['duel', duelId] });
            }}
          >
            <Text style={styles.primaryBtnText}>Réessayer</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => router.push(DefisRoutes.duelHub)}>
            <Text style={styles.secondaryBtnText}>Retour aux duels</Text>
          </Pressable>
        </View>
      </DefisPageShell>
    );
  }

  if (!isDuelResultReady(duel)) {
    return (
      <DefisPageShell title="Résultat">
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Duel encore en cours</Text>
          <Text style={styles.emptyBody}>
            Le résultat s&apos;affichera quand les deux joueurs auront terminé ou que le duel sera
            expiré / refusé.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.push(DefisRoutes.duelDetail(duelId))}>
            <Text style={styles.primaryBtnText}>Voir le duel →</Text>
          </Pressable>
        </View>
      </DefisPageShell>
    );
  }

  const isChallenger = duel.challengerId === userId;
  const myQuizScoreRaw = isChallenger ? duel.challengerScore : duel.challengedScore;
  const opponentQuizScoreRaw = isChallenger ? duel.challengedScore : duel.challengerScore;
  const myQuizScore = myQuizScoreRaw ?? 0;
  const opponentQuizScore = opponentQuizScoreRaw ?? 0;
  const opponentName = isChallenger ? duel.challengedName : duel.challengerName;
  const opponentUserId = isChallenger ? duel.challengedId : duel.challengerId;
  const myName =
    authMe?.profile?.full_name?.trim() ||
    authMe?.profile?.username?.trim() ||
    'Vous';

  const expired = duel.isExpired || duel.status === 'expired';
  const declined = duel.status === 'declined';
  const won =
    !expired &&
    !declined &&
    (duel.winnerId === userId || (duel.winnerId === null && myQuizScore > opponentQuizScore));

  const headline = expired
    ? '⏱ Duel expiré'
    : declined
      ? 'Défi refusé'
      : won
        ? '🎉 Victoire !'
        : 'Bien joué !';

  const subline = expired
    ? myQuizScoreRaw !== null && opponentQuizScoreRaw !== null
      ? `Score final : ${myQuizScoreRaw} - ${opponentQuizScoreRaw} pts`
      : isChallenger
        ? duel.challengerScore === null
          ? 'Vous n\'avez pas joué à temps.'
          : 'L\'adversaire n\'a pas terminé à temps.'
        : duel.challengedScore === null
          ? 'Vous n\'avez pas joué à temps.'
          : opponentQuizScoreRaw !== null
            ? `Adversaire : ${opponentQuizScoreRaw} pts · délai dépassé`
            : 'Le délai est dépassé.'
    : declined
      ? duel.challengedId === userId
        ? 'Vous avez refusé ce défi.'
        : `${opponentName} a refusé votre défi.`
      : won
        ? '+15 pts de récompense'
        : '+5 pts pour la participation';

  return (
    <DefisPageShell title="Résultat">
      {isFetching && duel ? (
        <View style={styles.refreshBar}>
          <ActivityIndicator color={COLORS.primary} size="small" />
          <Text style={styles.refreshText}>Mise à jour…</Text>
        </View>
      ) : null}

      <Animated.View entering={enteringAnimation} style={styles.headlineWrap}>
        <Text style={[styles.headline, (expired || declined) && styles.headlineMuted]}>{headline}</Text>
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
        myQuizScore={myQuizScoreRaw}
        showOpponentQuizScore
        revealScores={!declined}
        opponentQuizScore={opponentQuizScoreRaw}
        questionsCount={duel.questionsCount}
        expiresAt={duel.expiresAt}
        isExpired={expired}
        statusLabel={expired ? 'Expiré' : declined ? 'Refusé' : won ? 'Victoire' : 'Résultat'}
        motivationalLine={
          declined
            ? 'Aucune partie n\'a été jouée pour ce duel.'
            : expired
              ? myQuizScoreRaw !== null && opponentQuizScoreRaw !== null
                ? `${myQuizScoreRaw} vs ${opponentQuizScoreRaw} pts · duel archivé`
                : 'Ce duel est archivé dans vos duels récents.'
              : `${myQuizScoreRaw ?? 0} vs ${opponentQuizScoreRaw ?? 0} pts`
        }
      />

      {!expired && !declined && !won && opponentQuizScore > myQuizScore ? (
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
  loaderWrap: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  loaderText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  refreshBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  refreshText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyWrap: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  emptyTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
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
  headlineMuted: {
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
