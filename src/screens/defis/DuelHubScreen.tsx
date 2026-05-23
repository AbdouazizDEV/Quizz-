import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { DuelIncomingModal } from '@components/ui/defis/DuelIncomingModal';
import { DuelSentModal } from '@components/ui/defis/DuelSentModal';
import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { SectionTitle } from '@components/ui/common/SectionTitle';
import { COLORS } from '@constants/Colors';
import { DefisRoutes } from '@constants/defisRoutes';
import { useAuthMe } from '@hooks/useAuthMe';
import type { DuelSummary } from '@app-types/challenge.types';
import {
  createFriendDuel,
  fetchPendingDuelsForUser,
  fetchRecentDuelsForUser,
  respondToDuel,
} from '@services/defis/duelRepository';
import { searchFriendsForDuel } from '@services/defis/duelFriendsSearch';
import { useAppError } from '@providers/AppErrorProvider';

export default function DuelHubScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAppError } = useAppError();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';
  const [search, setSearch] = useState('');
  const [sentModal, setSentModal] = useState<{
    duel: DuelSummary;
    friendName: string;
  } | null>(null);
  const [incomingDuel, setIncomingDuel] = useState<DuelSummary | null>(null);
  const shownIncomingIds = useRef<Set<string>>(new Set());

  const { data: pending, isLoading: loadingPending } = useQuery({
    queryKey: ['duels-pending', userId],
    queryFn: () => fetchPendingDuelsForUser(userId),
    enabled: Boolean(userId),
  });

  const { data: recent, isLoading: loadingRecent } = useQuery({
    queryKey: ['duels-recent', userId],
    queryFn: () => fetchRecentDuelsForUser(userId),
    enabled: Boolean(userId),
  });

  const {
    data: friends,
    isLoading: loadingFriends,
    isError: friendsError,
    refetch: refetchFriends,
  } = useQuery({
    queryKey: ['duel-friends-search', search],
    queryFn: () => searchFriendsForDuel(search),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (!friendsError) return;
    showAppError('Impossible de charger la liste de vos amis. Vérifiez votre connexion.', {
      title: 'Amis',
      onRetry: () => void refetchFriends(),
    });
  }, [friendsError, refetchFriends, showAppError]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['duels-pending'] });
    await queryClient.invalidateQueries({ queryKey: ['duels-recent'] });
  };

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      void queryClient.invalidateQueries({ queryKey: ['duels-pending', userId] });
      void queryClient.invalidateQueries({ queryKey: ['duels-recent', userId] });
    }, [queryClient, userId]),
  );

  useEffect(() => {
    if (!pending?.length || !userId) return;
    const nextIncoming = pending.find(
      (duel) => duel.phase === 'needs_your_acceptance' && !shownIncomingIds.current.has(duel.id),
    );
    if (nextIncoming) {
      shownIncomingIds.current.add(nextIncoming.id);
      setIncomingDuel(nextIncoming);
    }
  }, [pending, userId]);

  const onQuickDuel = () => {
    Alert.alert('Duel rapide', 'Recherche d\'un adversaire aléatoire — bientôt disponible.');
  };

  const onChallengeFriend = async (friendName: string, friendId: string) => {
    if (!userId) return;
    try {
      const duel = await createFriendDuel(userId, friendId);
      await refresh();
      setSentModal({ duel, friendName });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de créer le duel.';
      showAppError(message, { title: 'Duel' });
    }
  };

  const onIncomingAccept = async () => {
    if (!incomingDuel || !userId) return;
    const duelId = incomingDuel.id;
    setIncomingDuel(null);
    try {
      await respondToDuel(duelId, userId, true);
      await refresh();
      router.push(DefisRoutes.duelDetail(duelId));
    } catch (error) {
      showAppError(error instanceof Error ? error.message : 'Impossible d\'accepter le duel.', {
        title: 'Duel',
      });
    }
  };

  const onIncomingDecline = async () => {
    if (!incomingDuel || !userId) return;
    const duelId = incomingDuel.id;
    setIncomingDuel(null);
    try {
      await respondToDuel(duelId, userId, false);
      await refresh();
    } catch (error) {
      showAppError(error instanceof Error ? error.message : 'Impossible de refuser le duel.', {
        title: 'Duel',
      });
    }
  };

  const onRespond = async (duelId: string, accept: boolean, challengerName: string) => {
    if (!userId) return;
    try {
      await respondToDuel(duelId, userId, accept);
      await refresh();
      if (accept) {
        Alert.alert('Défi accepté', `Le duel contre ${challengerName} est lancé. Bonne chance !`);
        router.push(DefisRoutes.duelDetail(duelId));
      } else {
        Alert.alert('Défi refusé', `${challengerName} sera notifié de votre refus.`);
      }
    } catch (error) {
      showAppError(error instanceof Error ? error.message : 'Une erreur est survenue.', {
        title: 'Duel',
      });
    }
  };

  const filteredFriends = friends ?? [];

  return (
    <DefisPageShell title="Duel">
      <DuelSentModal
        visible={sentModal !== null}
        friendName={sentModal?.friendName ?? ''}
        questionsCount={sentModal?.duel.questionsCount ?? 15}
        expiresAt={sentModal?.duel.expiresAt ?? new Date().toISOString()}
        onLater={() => setSentModal(null)}
        onPlayNow={() => {
          const duelId = sentModal?.duel.id;
          setSentModal(null);
          if (duelId) router.push(DefisRoutes.duelDetail(duelId));
        }}
      />

      <DuelIncomingModal
        visible={incomingDuel !== null}
        challengerName={incomingDuel?.challengerName ?? ''}
        questionsCount={incomingDuel?.questionsCount ?? 15}
        expiresAt={incomingDuel?.expiresAt ?? new Date().toISOString()}
        onAccept={() => void onIncomingAccept()}
        onDecline={() => void onIncomingDecline()}
        onClose={() => setIncomingDuel(null)}
      />

      <Pressable style={styles.heroCard} onPress={onQuickDuel}>
        <Text style={styles.heroEyebrow}>⚡ Duel rapide</Text>
        <Text style={styles.heroTitle}>Affrontez un adversaire aléatoire maintenant !</Text>
        <Text style={styles.heroMeta}>15 questions · ~3 min</Text>
        <Text style={styles.heroCta}>Jouer maintenant →</Text>
      </Pressable>

      <SectionTitle title="Défier un ami" />
      <TextInput
        style={styles.search}
        placeholder="🔍 Rechercher un ami..."
        placeholderTextColor={COLORS.textSecondary}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {loadingFriends ? <ActivityIndicator color={COLORS.primary} /> : null}
      {!loadingFriends && filteredFriends.length === 0 ? (
        <Text style={styles.empty}>
          {search.trim() ? 'Aucun ami trouvé pour cette recherche.' : 'Aucun ami dans votre réseau.'}
        </Text>
      ) : null}
      {filteredFriends.map((friend) => (
        <View key={friend.id} style={styles.friendRow}>
          <Image source={{ uri: friend.avatarUri }} style={styles.avatar} />
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{friend.displayName}</Text>
            <Text style={styles.friendHandle}>{friend.handle}</Text>
          </View>
          <Pressable
            style={styles.challengeBtn}
            onPress={() => void onChallengeFriend(friend.displayName, friend.id)}
          >
            <Text style={styles.challengeBtnText}>Défier</Text>
          </Pressable>
        </View>
      ))}

      <SectionTitle title="Duels en attente" />
      {loadingPending ? <ActivityIndicator color={COLORS.primary} /> : null}
      {(pending ?? []).length === 0 && !loadingPending ? (
        <Text style={styles.empty}>Aucun duel en attente.</Text>
      ) : null}
      {(pending ?? []).map((duel) => (
        <ActiveDuelCard
          key={duel.id}
          duel={duel}
          userId={userId}
          onRespond={onRespond}
          onOpen={() => router.push(DefisRoutes.duelDetail(duel.id))}
        />
      ))}

      <SectionTitle title="Mes duels récents" />
      {loadingRecent ? <ActivityIndicator color={COLORS.primary} /> : null}
      {(recent ?? []).length === 0 && !loadingRecent ? (
        <Text style={styles.empty}>Aucun duel terminé pour le moment.</Text>
      ) : null}
      <DefisSurfaceCard>
        {(recent ?? []).map((duel, index) => (
          <RecentDuelRow
            key={duel.id}
            duel={duel}
            userId={userId}
            isLast={index === (recent?.length ?? 0) - 1}
            onPress={() => {
              const hasScores =
                duel.challengerScore !== null && duel.challengedScore !== null;
              if (duel.status === 'completed' || hasScores) {
                router.push(DefisRoutes.duelResult(duel.id));
                return;
              }
              router.push(DefisRoutes.duelDetail(duel.id));
            }}
          />
        ))}
      </DefisSurfaceCard>
    </DefisPageShell>
  );
}

function getActiveDuelLabel(duel: DuelSummary, userId: string): string {
  const opponent =
    duel.challengerId === userId ? duel.challengedName : duel.challengerName;

  switch (duel.phase) {
    case 'needs_your_acceptance':
      return `${duel.challengerName} vous a défié`;
    case 'waiting_opponent_acceptance':
      return `En attente que ${opponent} accepte`;
    case 'your_turn':
      return `À vous de jouer vs ${opponent}`;
    case 'waiting_opponent_play':
      return `En attente de ${opponent}`;
    default:
      return `Duel vs ${opponent}`;
  }
}

function getActiveDuelMeta(duel: DuelSummary, userId: string): string {
  const isChallenger = duel.challengerId === userId;
  const myScore = isChallenger ? duel.challengerScore : duel.challengedScore;

  if (duel.phase === 'needs_your_acceptance') {
    return `${duel.questionsCount} questions · Acceptez ou refusez`;
  }
  if (duel.phase === 'waiting_opponent_acceptance') {
    return myScore !== null
      ? `Score envoyé (${myScore} pts) · En attente d'acceptation`
      : `${duel.questionsCount} questions · Défi envoyé`;
  }
  if (duel.phase === 'your_turn') {
    return `${duel.questionsCount} questions · Lancez votre partie`;
  }
  if (duel.phase === 'waiting_opponent_play') {
    return `Votre score : ${myScore ?? 0} pts · Adversaire n'a pas encore joué`;
  }
  return `${duel.questionsCount} questions`;
}

function ActiveDuelCard({
  duel,
  userId,
  onRespond,
  onOpen,
}: {
  duel: DuelSummary;
  userId: string;
  onRespond: (duelId: string, accept: boolean, challengerName: string) => void;
  onOpen: () => void;
}) {
  const title = getActiveDuelLabel(duel, userId);
  const meta = getActiveDuelMeta(duel, userId);
  const showAcceptDecline = duel.phase === 'needs_your_acceptance';
  const showPlay = duel.phase === 'your_turn' || duel.phase === 'waiting_opponent_acceptance';

  return (
    <Pressable style={styles.pendingCard} onPress={onOpen}>
      <Text style={styles.pendingTitle}>{title}</Text>
      <Text style={styles.pendingMeta}>{meta}</Text>
      {showAcceptDecline ? (
        <View style={styles.pendingActions}>
          <Pressable
            style={styles.acceptBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              void onRespond(duel.id, true, duel.challengerName);
            }}
          >
            <Text style={styles.acceptBtnText}>Accepter</Text>
          </Pressable>
          <Pressable
            style={styles.declineBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              void onRespond(duel.id, false, duel.challengerName);
            }}
          >
            <Text style={styles.declineBtnText}>Refuser</Text>
          </Pressable>
        </View>
      ) : null}
      {showPlay ? (
        <Pressable
          style={styles.openDuelBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            onOpen();
          }}
        >
          <Text style={styles.openDuelBtnText}>
            {duel.phase === 'your_turn' ? 'Jouer maintenant →' : 'Voir le duel →'}
          </Text>
        </Pressable>
      ) : null}
      {duel.phase === 'waiting_opponent_play' ? (
        <Text style={styles.pendingHint}>Vous serez notifié quand l&apos;adversaire aura joué.</Text>
      ) : null}
    </Pressable>
  );
}

function resolveDuelOutcome(duel: DuelSummary, userId: string) {
  if (duel.status === 'declined') {
    const refusedByMe = duel.challengedId === userId;
    return {
      label: refusedByMe ? 'Refusé' : 'Décliné',
      points: '+0 pts',
      won: false,
      lost: !refusedByMe,
    };
  }

  const isChallenger = duel.challengerId === userId;
  const myScore = isChallenger ? duel.challengerScore ?? 0 : duel.challengedScore ?? 0;
  const oppScore = isChallenger ? duel.challengedScore ?? 0 : duel.challengerScore ?? 0;

  if (duel.winnerId === userId) {
    return { label: 'Victoire', points: '+15 pts', won: true, lost: false };
  }
  if (duel.winnerId && duel.winnerId !== userId) {
    return { label: 'Défaite', points: '+5 pts', won: false, lost: true };
  }
  if (myScore > oppScore) {
    return { label: 'Victoire', points: '+15 pts', won: true, lost: false };
  }
  if (myScore < oppScore) {
    return { label: 'Défaite', points: '+5 pts', won: false, lost: true };
  }
  return { label: 'Égalité', points: '+5 pts', won: false, lost: false };
}

function RecentDuelRow({
  duel,
  userId,
  isLast,
  onPress,
}: {
  duel: DuelSummary;
  userId: string;
  isLast: boolean;
  onPress: () => void;
}) {
  const opponent =
    duel.challengerId === userId ? duel.challengedName : duel.challengerName;
  const outcome = resolveDuelOutcome(duel, userId);
  const isChallenger = duel.challengerId === userId;
  const myScore = isChallenger ? duel.challengerScore : duel.challengedScore;
  const oppScore = isChallenger ? duel.challengedScore : duel.challengerScore;
  const scoreLine =
    myScore !== null && oppScore !== null ? `${myScore} - ${oppScore} pts` : null;

  return (
    <Pressable style={[styles.recentRow, !isLast && styles.recentRowBorder]} onPress={onPress}>
      <View style={styles.recentMain}>
        <Text style={styles.recentName}>{opponent}</Text>
        {scoreLine ? <Text style={styles.recentScoreLine}>{scoreLine}</Text> : null}
      </View>
      <Text style={[styles.recentOutcome, outcome.won && styles.win, outcome.lost && styles.loss]}>
        {outcome.label}
      </Text>
      <Text style={styles.recentPoints}>{outcome.points}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroEyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: COLORS.textLight,
  },
  heroMeta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  heroCta: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.textLight,
    alignSelf: 'flex-end',
  },
  search: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  friendInfo: {
    flex: 1,
    gap: 2,
  },
  friendName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  friendHandle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  challengeBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  challengeBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.primaryDark,
  },
  empty: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  pendingCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  pendingTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  pendingMeta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  pendingHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  openDuelBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
  },
  openDuelBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.textLight,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textLight,
    fontSize: 14,
  },
  declineBtn: {
    flex: 1,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  declineBtnText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  recentMain: {
    flex: 1,
    gap: 2,
  },
  recentScoreLine: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  recentName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  recentRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  recentOutcome: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  win: { color: COLORS.success },
  loss: { color: COLORS.error },
  recentPoints: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.primary,
    width: 56,
    textAlign: 'right',
  },
});
