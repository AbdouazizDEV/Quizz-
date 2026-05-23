import { useState } from 'react';
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
import { useRouter } from 'expo-router';

import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { SectionTitle } from '@components/ui/common/SectionTitle';
import { DefisRoutes } from '@constants/defisRoutes';
import { COLORS } from '@constants/Colors';
import { buildQuizEntryHref } from '@constants/Routes';
import { useAuthMe } from '@hooks/useAuthMe';
import type { DuelSummary } from '@app-types/challenge.types';
import {
  createFriendDuel,
  fetchPendingDuelsForUser,
  fetchRecentDuelsForUser,
  respondToDuel,
} from '@services/defis/duelRepository';
import { searchFriendsForDuel } from '@services/defis/duelFriendsSearch';

export default function DuelHubScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';
  const [search, setSearch] = useState('');

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

  const { data: friends, isLoading: loadingFriends, isError: friendsError } = useQuery({
    queryKey: ['duel-friends-search', search],
    queryFn: () => searchFriendsForDuel(search),
    enabled: Boolean(userId),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['duels-pending'] });
    await queryClient.invalidateQueries({ queryKey: ['duels-recent'] });
  };

  const onQuickDuel = () => {
    Alert.alert('Duel rapide', 'Recherche d\'un adversaire aléatoire — bientôt disponible.');
  };

  const onChallengeFriend = async (friendName: string, friendId: string) => {
    if (!userId) return;
    try {
      const duel = await createFriendDuel(userId, friendId);
      await refresh();
      Alert.alert(
        'Défi envoyé',
        `${friendName} a reçu une notification avec les détails du défi. Vous pouvez jouer vos questions dès maintenant.`,
        [
          { text: 'Plus tard', style: 'cancel' },
          {
            text: 'Jouer maintenant',
            onPress: () => router.push(DefisRoutes.duelDetail(duel.id)),
          },
        ],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de créer le duel.';
      Alert.alert('Duel', message);
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
      Alert.alert('Duel', error instanceof Error ? error.message : 'Erreur');
    }
  };

  const filteredFriends = friends ?? [];

  return (
    <DefisPageShell title="Duel">
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
      {friendsError ? (
        <Text style={styles.empty}>Impossible de charger vos amis.</Text>
      ) : null}
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
        <PendingDuelCard key={duel.id} duel={duel} onRespond={onRespond} />
      ))}

      <SectionTitle title="Mes duels récents" />
      {loadingRecent ? <ActivityIndicator color={COLORS.primary} /> : null}
      <DefisSurfaceCard>
        {(recent ?? []).map((duel, index) => (
          <RecentDuelRow
            key={duel.id}
            duel={duel}
            userId={userId}
            isLast={index === (recent?.length ?? 0) - 1}
            onPress={() => router.push(DefisRoutes.duelResult(duel.id))}
          />
        ))}
      </DefisSurfaceCard>
    </DefisPageShell>
  );
}

function PendingDuelCard({
  duel,
  onRespond,
}: {
  duel: DuelSummary;
  onRespond: (duelId: string, accept: boolean, challengerName: string) => void;
}) {
  return (
    <View style={styles.pendingCard}>
      <Text style={styles.pendingTitle}>{duel.challengerName} vous a défié</Text>
      <Text style={styles.pendingMeta}>{duel.questionsCount} questions · Quiz du défi</Text>
      <View style={styles.pendingActions}>
        <Pressable
          style={styles.acceptBtn}
          onPress={() => void onRespond(duel.id, true, duel.challengerName)}
        >
          <Text style={styles.acceptBtnText}>Accepter</Text>
        </Pressable>
        <Pressable
          style={styles.declineBtn}
          onPress={() => void onRespond(duel.id, false, duel.challengerName)}
        >
          <Text style={styles.declineBtnText}>Refuser</Text>
        </Pressable>
      </View>
    </View>
  );
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
  const won = duel.winnerId === userId;
  const lost = duel.winnerId !== null && duel.winnerId !== userId;
  const outcome = won ? 'Victoire' : lost ? 'Défaite' : 'Terminé';
  const points = won ? '+15 pts' : '+5 pts';

  return (
    <Pressable style={[styles.recentRow, !isLast && styles.recentRowBorder]} onPress={onPress}>
      <Text style={styles.recentName}>{opponent}</Text>
      <Text style={[styles.recentOutcome, won && styles.win, lost && styles.loss]}>{outcome}</Text>
      <Text style={styles.recentPoints}>{points}</Text>
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
  recentRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  recentName: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.textPrimary,
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
