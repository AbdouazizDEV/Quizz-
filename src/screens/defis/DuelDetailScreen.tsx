import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { DuelMatchHero } from '@components/ui/defis/DuelMatchHero';
import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { SectionTitle } from '@components/ui/common/SectionTitle';
import { COLORS } from '@constants/Colors';
import { DefisRoutes } from '@constants/defisRoutes';
import { buildQuizEntryHref } from '@constants/Routes';
import { useAuthMe } from '@hooks/useAuthMe';
import { isDuelResultReady, useDuelQuery } from '@hooks/defis/useDuelQuery';
import { isQuizFullyCompletedByPlayer } from '@services/quiz/replay/quizReplayService';
import { useAppError } from '@providers/AppErrorProvider';
import { resolveRouteParamId } from '@utils/resolveRouteParamId';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getDuelUiState(params: {
  status: string;
  isExpired: boolean;
  isChallenger: boolean;
  isChallenged: boolean;
  myScore: number | null;
  opponentScore: number | null;
  opponentName: string;
}): { statusLabel: string; motivationalLine: string; tips: string[] } {
  const { status, isExpired, isChallenger, isChallenged, myScore, opponentScore, opponentName } =
    params;

  if (isExpired || status === 'expired') {
    return {
      statusLabel: 'Expiré',
      motivationalLine: 'Le délai de 30 minutes est dépassé ⏱',
      tips: [
        'Ce duel figure dans « Mes duels récents ».',
        myScore === null ? 'Vous n\'avez pas joué avant l\'expiration.' : 'Votre score quiz a été enregistré.',
      ],
    };
  }

  if (status === 'declined') {
    return {
      statusLabel: 'Refusé',
      motivationalLine: 'Ce duel n\'a pas abouti…',
      tips: ['Proposez une revanche à un autre moment !'],
    };
  }

  if (isChallenged && status === 'pending') {
    return {
      statusLabel: 'Invitation',
      motivationalLine: `${opponentName} vous défie — entrez dans l'arène ! 🎯`,
      tips: [
        'Acceptez ou refusez depuis « Duels en attente » (30 min max).',
        'Une seule partie : donnez le meilleur de vous-même !',
      ],
    };
  }

  if (isChallenger && status === 'pending' && myScore === null) {
    return {
      statusLabel: 'En cours',
      motivationalLine: 'Montrez votre niveau avant qu\'il ne réponde ! 🔥',
      tips: [
        'Jouez maintenant : votre score reste secret jusqu\'à la fin.',
        'Votre adversaire a 30 minutes pour accepter et jouer.',
      ],
    };
  }

  if (isChallenger && status === 'pending' && myScore !== null) {
    return {
      statusLabel: 'En attente',
      motivationalLine: `Score enregistré — ${opponentName} doit encore répondre ⏳`,
      tips: ['Vous serez notifié dès qu\'il accepte ou refuse le défi.'],
    };
  }

  if (myScore === null && (status === 'accepted' || status === 'pending')) {
    return {
      statusLabel: 'À vous !',
      motivationalLine: 'C\'est le moment de briller — lancez-vous ! ⚡',
      tips: [
        'Chaque bonne réponse rapproche la victoire.',
        'Le score adverse reste caché jusqu\'à la fin du duel.',
      ],
    };
  }

  if (myScore !== null && opponentScore === null) {
    return {
      statusLabel: 'Score envoyé',
      motivationalLine: `Vous avez joué — ${opponentName} doit encore répondre 💪`,
      tips: ['Patience… le suspense fait partie du jeu !'],
    };
  }

  if (myScore !== null && opponentScore !== null) {
    return {
      statusLabel: 'Terminé',
      motivationalLine: 'Les deux joueurs ont terminé — découvrez le résultat ! 🏆',
      tips: ['Consultez le résultat pour voir qui a gagné.'],
    };
  }

  return {
    statusLabel: 'Duel',
    motivationalLine: 'Que le meilleur gagne ! 🏆',
    tips: ['Comparez vos scores une fois les deux parties terminées.'],
  };
}

export default function DuelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const duelId = resolveRouteParamId(id);
  const router = useRouter();
  const { showAppError } = useAppError();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';
  const ctaPulse = useSharedValue(1);

  const { data: duel, isLoading, isError, error, refetch } = useDuelQuery(duelId);
  const { data: quizFullyCompleted = false } = useQuery({
    queryKey: ['quiz-fully-completed', userId, duel?.quizId],
    enabled: Boolean(userId && duel?.quizId),
    queryFn: () => isQuizFullyCompletedByPlayer(userId, duel!.quizId),
  });

  useEffect(() => {
    if (!isError) return;
    showAppError(error instanceof Error ? error.message : 'Impossible de charger le duel.', {
      title: 'Duel',
      onRetry: () => void refetch(),
    });
  }, [error, isError, refetch, showAppError]);

  useFocusEffect(
    useCallback(() => {
      if (!duelId) return;
      void refetch();
    }, [duelId, refetch]),
  );

  const isChallenger = duel?.challengerId === userId;
  const isChallenged = duel?.challengedId === userId;
  const myQuizScore = duel
    ? isChallenger
      ? duel.challengerScore
      : duel.challengedScore
    : null;
  const opponentQuizScore = duel
    ? isChallenger
      ? duel.challengedScore
      : duel.challengerScore
    : null;

  const canPlay =
    duel &&
    !duel.isExpired &&
    !quizFullyCompleted &&
    duel.quizId &&
    ((duel.challengerId === userId &&
      (duel.status === 'pending' || duel.status === 'accepted') &&
      duel.challengerScore === null) ||
      (duel.challengedId === userId && duel.status === 'accepted' && duel.challengedScore === null));

  const bothPlayed = Boolean(
    duel && myQuizScore !== null && opponentQuizScore !== null && isDuelResultReady(duel),
  );
  const showResultCta = Boolean(duel && isDuelResultReady(duel));

  useEffect(() => {
    if (canPlay) {
      ctaPulse.value = withRepeat(
        withSequence(withTiming(1.03, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        false,
      );
      return;
    }
    ctaPulse.value = withTiming(1, { duration: 200 });
  }, [canPlay, ctaPulse]);

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaPulse.value }],
  }));

  if ((isLoading && !duel) || !duelId) {
    return (
      <DefisPageShell title="Duel">
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      </DefisPageShell>
    );
  }

  if (!duel) {
    return (
      <DefisPageShell title="Duel">
        <Text style={styles.loader}>Duel introuvable.</Text>
      </DefisPageShell>
    );
  }

  const opponentName = isChallenger ? duel.challengedName : duel.challengerName;
  const opponentUserId = isChallenger ? duel.challengedId : duel.challengerId;
  const myName =
    authMe?.profile?.full_name?.trim() ||
    authMe?.profile?.username?.trim() ||
    'Vous';
  const myTotalScore = isChallenger ? duel.challengerTotalScore : duel.challengedTotalScore;
  const opponentTotalScore = isChallenger ? duel.challengedTotalScore : duel.challengerTotalScore;
  const myAvatar = isChallenger ? duel.challengerAvatarUrl : duel.challengedAvatarUrl;
  const opponentAvatar = isChallenger ? duel.challengedAvatarUrl : duel.challengerAvatarUrl;

  const ui = getDuelUiState({
    status: duel.status,
    isExpired: duel.isExpired,
    isChallenger,
    isChallenged,
    myScore: myQuizScore,
    opponentScore: opponentQuizScore,
    opponentName,
  });

  return (
    <DefisPageShell title="Duel">
      <DuelMatchHero
        myName={myName}
        myUserId={userId}
        myAvatarUrl={myAvatar ?? authMe?.profile?.avatar_url}
        myTotalScore={myTotalScore}
        opponentName={opponentName}
        opponentUserId={opponentUserId}
        opponentAvatarUrl={opponentAvatar}
        opponentTotalScore={opponentTotalScore}
        myQuizScore={myQuizScore}
        showOpponentQuizScore={bothPlayed || duel.status === 'completed'}
        revealScores={
          bothPlayed ||
          duel.status === 'completed' ||
          duel.isExpired ||
          duel.status === 'expired' ||
          opponentQuizScore !== null
        }
        opponentQuizScore={opponentQuizScore}
        questionsCount={duel.questionsCount}
        expiresAt={duel.expiresAt}
        isExpired={duel.isExpired}
        statusLabel={ui.statusLabel}
        motivationalLine={ui.motivationalLine}
      />

      <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.rulesCard}>
        <SectionTitle title="Règles du duel" />
        <View style={styles.rulesBox}>
          {ui.tips.map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <Text style={styles.tipBullet}>✦</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {canPlay ? (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <AnimatedPressable
            style={[styles.primaryBtn, ctaAnimatedStyle]}
            onPress={() => router.push(buildQuizEntryHref(duel.quizId, { duelId: duel.id }))}
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnEmoji}>🎮</Text>
            <Text style={styles.primaryBtnText}>Jouer mes questions</Text>
            <Text style={styles.primaryBtnArrow}>→</Text>
          </AnimatedPressable>
          <Text style={styles.ctaHint}>Prêt ? Chaque seconde compte !</Text>
        </Animated.View>
      ) : null}

      {duel && !canPlay && !duel.isExpired && quizFullyCompleted && myQuizScore === null ? (
        <View style={styles.expiredBanner}>
          <Text style={styles.expiredText}>
            Vous avez déjà terminé ce quiz. Il n’est pas rejouable en duel.
          </Text>
        </View>
      ) : null}

      {showResultCta ? (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push(DefisRoutes.duelResult(duel.id))}
          >
            <Text style={styles.primaryBtnText}>Voir le résultat →</Text>
          </Pressable>
        </Animated.View>
      ) : null}

      {duel.status === 'declined' ? (
        <View style={styles.declinedBanner}>
          <Text style={styles.declinedText}>Ce défi a été refusé.</Text>
        </View>
      ) : null}

      {duel.isExpired ? (
        <View style={styles.expiredBanner}>
          <Text style={styles.expiredText}>
            Ce duel a expiré. Retrouvez-le dans « Mes duels récents ».
          </Text>
        </View>
      ) : null}

      {isChallenged && duel.status === 'pending' && !duel.isExpired ? (
        <View style={styles.waitBanner}>
          <Text style={styles.waitBannerText}>
            Acceptez d&apos;abord le défi depuis la section « Duels en attente » pour jouer.
          </Text>
        </View>
      ) : null}
    </DefisPageShell>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 40,
  },
  rulesCard: {
    gap: 4,
  },
  rulesBox: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  primaryBtnEmoji: {
    fontSize: 20,
  },
  primaryBtnText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    color: COLORS.textLight,
  },
  primaryBtnArrow: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: COLORS.textLight,
  },
  ctaHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  declinedBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  declinedText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },
  expiredBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  expiredText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    lineHeight: 20,
  },
  waitBanner: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  waitBannerText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
