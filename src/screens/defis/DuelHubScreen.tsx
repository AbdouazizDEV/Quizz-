import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { ActiveDuelCard } from '@components/ui/defis/ActiveDuelCard';
import { DuelFriendRow } from '@components/ui/defis/DuelFriendRow';
import { DuelIncomingModal } from '@components/ui/defis/DuelIncomingModal';
import { DuelSentModal } from '@components/ui/defis/DuelSentModal';
import { DuelViewAllLink } from '@components/ui/defis/DuelViewAllLink';
import { RecentDuelRow } from '@components/ui/defis/RecentDuelRow';
import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { SectionTitle } from '@components/ui/common/SectionTitle';
import { COLORS } from '@constants/Colors';
import {
  DUEL_HUB_FRIENDS_PREVIEW,
  DUEL_HUB_PENDING_PREVIEW,
  DUEL_HUB_RECENT_PREVIEW,
} from '@constants/duelList';
import { DefisRoutes } from '@constants/defisRoutes';
import { useAuthMe } from '@hooks/useAuthMe';
import type { DuelSummary } from '@app-types/challenge.types';
import {
  createFriendDuel,
  fetchPendingDuelsForUser,
  fetchRecentDuelsForUser,
  respondToDuel,
} from '@services/defis/duelRepository';
import { fetchFriendsForDuelPaginated } from '@services/defis/duelFriendsSearch';
import { useAppError } from '@providers/AppErrorProvider';
import { openDuelFromList } from '@utils/defis/openDuelFromList';

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
  const [respondingDuelId, setRespondingDuelId] = useState<string | null>(null);
  const shownIncomingIds = useRef<Set<string>>(new Set());

  const { data: pendingPage, isLoading: loadingPending } = useQuery({
    queryKey: ['duels-pending', userId],
    queryFn: () =>
      fetchPendingDuelsForUser(userId, { page: 1, limit: DUEL_HUB_PENDING_PREVIEW }),
    enabled: Boolean(userId),
  });

  const { data: recentPage, isLoading: loadingRecent } = useQuery({
    queryKey: ['duels-recent', userId],
    queryFn: () =>
      fetchRecentDuelsForUser(userId, { page: 1, limit: DUEL_HUB_RECENT_PREVIEW }),
    enabled: Boolean(userId),
  });

  const {
    data: friendsPage,
    isLoading: loadingFriends,
    isError: friendsError,
    refetch: refetchFriends,
  } = useQuery({
    queryKey: ['duel-friends-search', search.trim()],
    queryFn: () => fetchFriendsForDuelPaginated(search, 1, DUEL_HUB_FRIENDS_PREVIEW),
    enabled: Boolean(userId),
  });

  const pendingItems = pendingPage?.items ?? [];
  const pendingTotal = pendingPage?.total ?? 0;
  const recentItems = recentPage?.items ?? [];
  const recentTotal = recentPage?.total ?? 0;
  const friendItems = friendsPage?.items ?? [];
  const friendsTotal = friendsPage?.total ?? 0;

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
    if (!pendingItems.length || !userId) return;
    const nextIncoming = pendingItems.find(
      (duel) => duel.phase === 'needs_your_acceptance' && !shownIncomingIds.current.has(duel.id),
    );
    if (nextIncoming) {
      shownIncomingIds.current.add(nextIncoming.id);
      setIncomingDuel(nextIncoming);
    }
  }, [pendingItems, userId]);

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
    setRespondingDuelId(duelId);
    try {
      await respondToDuel(duelId, userId, true);
      await refresh();
      router.push(DefisRoutes.duelDetail(duelId));
    } catch (error) {
      showAppError(error instanceof Error ? error.message : 'Impossible d\'accepter le duel.', {
        title: 'Duel',
      });
    } finally {
      setRespondingDuelId(null);
    }
  };

  const onIncomingDecline = async () => {
    if (!incomingDuel || !userId) return;
    const duelId = incomingDuel.id;
    setIncomingDuel(null);
    setRespondingDuelId(duelId);
    try {
      await respondToDuel(duelId, userId, false);
      await refresh();
    } catch (error) {
      showAppError(error instanceof Error ? error.message : 'Impossible de refuser le duel.', {
        title: 'Duel',
      });
    } finally {
      setRespondingDuelId(null);
    }
  };

  const onRespond = async (duelId: string, accept: boolean, challengerName: string) => {
    if (!userId || respondingDuelId) return;
    setRespondingDuelId(duelId);
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
        onRetry: () => void onRespond(duelId, accept, challengerName),
      });
    } finally {
      setRespondingDuelId(null);
    }
  };

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

      <SectionTitle
        title={friendsTotal > 0 ? `Défier un ami (${friendsTotal})` : 'Défier un ami'}
      />
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
      {!loadingFriends && friendItems.length === 0 ? (
        <Text style={styles.empty}>
          {search.trim() ? 'Aucun ami trouvé pour cette recherche.' : 'Aucun ami dans votre réseau.'}
        </Text>
      ) : null}
      {!loadingFriends && friendsTotal > DUEL_HUB_FRIENDS_PREVIEW ? (
        <Text style={styles.listHint}>
          {search.trim()
            ? `${friendsTotal} résultat${friendsTotal > 1 ? 's' : ''} · affichage limité`
            : `${friendsTotal} amis · utilisez la recherche pour filtrer`}
        </Text>
      ) : null}
      {friendItems.map((friend) => (
        <DuelFriendRow
          key={friend.id}
          friend={friend}
          onChallenge={() => void onChallengeFriend(friend.displayName, friend.id)}
        />
      ))}
      <DuelViewAllLink
        totalCount={friendsTotal}
        visibleCount={DUEL_HUB_FRIENDS_PREVIEW}
        onPress={() => router.push(DefisRoutes.duelFriendsList)}
      />

      <SectionTitle
        title={pendingTotal > 0 ? `Duels en attente (${pendingTotal})` : 'Duels en attente'}
      />
      {loadingPending ? <ActivityIndicator color={COLORS.primary} /> : null}
      {pendingTotal === 0 && !loadingPending ? (
        <Text style={styles.empty}>Aucun duel en attente.</Text>
      ) : null}
      <View style={styles.pendingList}>
        {pendingItems.map((duel) => (
          <ActiveDuelCard
            key={duel.id}
            duel={duel}
            userId={userId}
            busy={respondingDuelId === duel.id}
            onRespond={onRespond}
            onOpen={() => router.push(DefisRoutes.duelDetail(duel.id))}
          />
        ))}
      </View>
      <DuelViewAllLink
        totalCount={pendingTotal}
        visibleCount={DUEL_HUB_PENDING_PREVIEW}
        onPress={() => router.push(DefisRoutes.duelPendingList)}
      />

      <SectionTitle
        title={recentTotal > 0 ? `Mes duels récents (${recentTotal})` : 'Mes duels récents'}
      />
      {loadingRecent ? <ActivityIndicator color={COLORS.primary} /> : null}
      {recentTotal === 0 && !loadingRecent ? (
        <Text style={styles.empty}>Aucun duel terminé pour le moment.</Text>
      ) : null}
      {recentTotal > 0 ? (
        <DefisSurfaceCard>
          {recentItems.map((duel, index) => (
            <RecentDuelRow
              key={duel.id}
              duel={duel}
              userId={userId}
              isLast={index === recentItems.length - 1}
              onPress={() => openDuelFromList(router, queryClient, duel)}
            />
          ))}
        </DefisSurfaceCard>
      ) : null}
      <DuelViewAllLink
        totalCount={recentTotal}
        visibleCount={DUEL_HUB_RECENT_PREVIEW}
        onPress={() => router.push(DefisRoutes.duelRecentList)}
      />
    </DefisPageShell>
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
  empty: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  listHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: -4,
    marginBottom: 4,
  },
  pendingList: {
    gap: 10,
  },
});
