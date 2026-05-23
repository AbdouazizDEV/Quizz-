import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { DuelMatchHero } from '@components/ui/defis/DuelMatchHero';
import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { SectionTitle } from '@components/ui/common/SectionTitle';
import { COLORS } from '@constants/Colors';
import { buildQuizEntryHref } from '@constants/Routes';
import { useAuthMe } from '@hooks/useAuthMe';
import { fetchDuelById } from '@services/defis/duelRepository';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getDuelUiState(params: {
  status: string;
  isChallenger: boolean;
  isChallenged: boolean;
  myScore: number | null;
  opponentScore: number | null;
  opponentName: string;
}): { statusLabel: string; motivationalLine: string; tips: string[] } {
  const { status, isChallenger, isChallenged, myScore, opponentScore, opponentName } = params;

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
        'Acceptez le défi depuis l\'onglet Duel si ce n\'est pas déjà fait.',
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
        'Votre adversaire a 48 h pour accepter et jouer.',
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

  return {
    statusLabel: 'Duel',
    motivationalLine: 'Que le meilleur gagne ! 🏆',
    tips: ['Comparez vos scores une fois les deux parties terminées.'],
  };
}

export default function DuelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const duelId = typeof id === 'string' ? id : '';
  const router = useRouter();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';
  const ctaPulse = useSharedValue(1);

  const { data: duel, isLoading } = useQuery({
    queryKey: ['duel', duelId],
    queryFn: () => fetchDuelById(duelId),
    enabled: Boolean(duelId),
  });

  const canPlay =
    duel &&
    duel.quizId &&
    ((duel.challengerId === userId &&
      (duel.status === 'pending' || duel.status === 'accepted') &&
      duel.challengerScore === null) ||
      (duel.challengedId === userId && duel.status === 'accepted' && duel.challengedScore === null));

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

  if (isLoading || !duel) {
    return (
      <DefisPageShell title="Duel">
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      </DefisPageShell>
    );
  }

  const isChallenger = duel.challengerId === userId;
  const isChallenged = duel.challengedId === userId;
  const myScore = isChallenger ? duel.challengerScore : duel.challengedScore;
  const opponentScore = isChallenger ? duel.challengedScore : duel.challengerScore;
  const opponentName = isChallenger ? duel.challengedName : duel.challengerName;
  const opponentUserId = isChallenger ? duel.challengedId : duel.challengerId;
  const myName =
    authMe?.profile?.full_name?.trim() ||
    authMe?.profile?.username?.trim() ||
    'Vous';

  const ui = getDuelUiState({
    status: duel.status,
    isChallenger,
    isChallenged,
    myScore,
    opponentScore,
    opponentName,
  });

  return (
    <DefisPageShell title="Duel">
      <DuelMatchHero
        myName={myName}
        myUserId={userId}
        myAvatarUrl={authMe?.profile?.avatar_url}
        opponentName={opponentName}
        opponentUserId={opponentUserId}
        myScore={myScore}
        showOpponentScore={duel.status === 'completed' && opponentScore !== null}
        opponentScore={opponentScore}
        questionsCount={duel.questionsCount}
        expiresAt={duel.expiresAt}
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
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>🔒</Text>
            <Text style={styles.tipText}>
              Le score de l&apos;adversaire reste secret jusqu&apos;à la fin de la partie.
            </Text>
          </View>
        </View>
      </Animated.View>

      {canPlay ? (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <AnimatedPressable
            style={[styles.primaryBtn, ctaAnimatedStyle]}
            onPress={() => router.push(buildQuizEntryHref(duel.quizId))}
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnEmoji}>🎮</Text>
            <Text style={styles.primaryBtnText}>Jouer mes questions</Text>
            <Text style={styles.primaryBtnArrow}>→</Text>
          </AnimatedPressable>
          <Text style={styles.ctaHint}>Prêt ? Chaque seconde compte !</Text>
        </Animated.View>
      ) : null}

      {duel.status === 'declined' ? (
        <View style={styles.declinedBanner}>
          <Text style={styles.declinedText}>Ce défi a été refusé.</Text>
        </View>
      ) : null}

      {isChallenged && duel.status === 'pending' ? (
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
