import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { CountdownTimer } from '@components/atoms/CountdownTimer';
import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisRoutes } from '@constants/defisRoutes';
import { COLORS } from '@constants/Colors';
import { useAuthMe } from '@hooks/useAuthMe';
import {
  fetchCompetitionById,
  registerForCompetition,
  unregisterFromCompetition,
} from '@services/defis/competitionRepository';

export default function TournoiDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const competitionId = typeof id === 'string' ? id : '';
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['competition', competitionId, userId],
    queryFn: () => fetchCompetitionById(competitionId, userId),
    enabled: Boolean(competitionId && userId),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['competition', competitionId] });
  };

  const onRegister = async () => {
    if (!userId) return;
    try {
      await registerForCompetition(userId, competitionId);
      await refresh();
      Alert.alert('Tournoi', '✓ Vous êtes inscrit !');
    } catch (error) {
      Alert.alert('Tournoi', error instanceof Error ? error.message : 'Inscription impossible.');
    }
  };

  const onUnregister = async () => {
    if (!userId) return;
    try {
      await unregisterFromCompetition(userId, competitionId);
      await refresh();
    } catch (error) {
      Alert.alert('Tournoi', error instanceof Error ? error.message : 'Erreur');
    }
  };

  if (isLoading || !data) {
    return (
      <DefisPageShell title="Tournoi">
        <ActivityIndicator color={COLORS.primary} />
      </DefisPageShell>
    );
  }

  const isOpen = data.status === 'scheduled';
  const isLive = data.status === 'live';
  const isDone = data.status === 'completed';

  return (
    <DefisPageShell title="Tournoi">
      <Text style={styles.title}>{data.title}</Text>
      <Text style={styles.meta}>
        {data.registeredCount}/{data.maxParticipants} inscrits · Élimination directe
      </Text>
      {data.startsAt ? <CountdownTimer endsAt={data.startsAt} /> : null}
      {data.rewardText ? <Text style={styles.reward}>🎁 {data.rewardText}</Text> : null}
      <Text style={styles.note}>Gratuit · Résultats en direct · 🎁 Récompenses à gagner</Text>

      {isOpen && !data.isRegistered ? (
        <Pressable style={styles.primaryBtn} onPress={() => void onRegister()}>
          <Text style={styles.primaryBtnText}>S&apos;inscrire au tournoi</Text>
        </Pressable>
      ) : null}

      {isOpen && data.isRegistered ? (
        <>
          <Text style={styles.success}>✓ Vous êtes inscrit !</Text>
          <Pressable style={styles.secondaryBtn} disabled>
            <Text style={styles.secondaryBtnText}>Voir le bracket (bientôt)</Text>
          </Pressable>
          <Pressable onPress={() => void onUnregister()}>
            <Text style={styles.unlink}>Se désinscrire</Text>
          </Pressable>
        </>
      ) : null}

      {isLive ? (
        <>
          <View style={styles.matchCard}>
            <Text style={styles.matchTitle}>Mon prochain match</Text>
            <Text style={styles.matchMeta}>Jouez quand vous voulez avant la fin du tournoi</Text>
            <Pressable style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Jouer mon match →</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => router.push(DefisRoutes.tournoiBracket(competitionId))}>
            <Text style={styles.link}>Voir le bracket complet →</Text>
          </Pressable>
        </>
      ) : null}

      {isDone ? (
        <Pressable onPress={() => router.push(DefisRoutes.tournoiBracket(competitionId))}>
          <Text style={styles.link}>Voir le bracket final →</Text>
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
  reward: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  note: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textLight,
    fontSize: 15,
  },
  secondaryBtn: {
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
  success: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.success,
    fontSize: 16,
  },
  unlink: {
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.error,
    textAlign: 'center',
    fontSize: 13,
  },
  matchCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  matchTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  matchMeta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  link: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.primaryDark,
    fontSize: 14,
    textAlign: 'right',
  },
});
