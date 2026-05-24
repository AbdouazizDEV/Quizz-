import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';

import { CompetitionHeroBanner } from '@components/ui/defis/CompetitionHeroBanner';
import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { DefisRoutes } from '@constants/defisRoutes';
import { COLORS } from '@constants/Colors';
import { useAuthMe } from '@hooks/useAuthMe';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import {
  fetchCompetitionById,
  registerForCompetition,
  unregisterFromCompetition,
} from '@services/defis/competitionRepository';
import { useAppError } from '@providers/AppErrorProvider';

export default function TournoiDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const competitionId = typeof id === 'string' ? id : '';
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAppError } = useAppError();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';
  const { isOnline } = useNetworkStatus();

  const { data, isLoading, isError, error } = useQuery({
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
      const result = await registerForCompetition(userId, competitionId);
      await refresh();
      Alert.alert(
        'Tournoi',
        result.queued
          ? '✓ Inscription enregistrée — synchronisation à la reconnexion.'
          : '✓ Vous êtes inscrit !',
      );
    } catch (registerError) {
      showAppError(
        registerError instanceof Error ? registerError.message : 'Inscription impossible.',
        { title: 'Tournoi' },
      );
    }
  };

  const onUnregister = async () => {
    if (!userId) return;
    try {
      const result = await unregisterFromCompetition(userId, competitionId);
      await refresh();
      if (result.queued) {
        Alert.alert('Tournoi', '✓ Désinscription enregistrée — synchronisation à la reconnexion.');
      }
    } catch (unregisterError) {
      showAppError(
        unregisterError instanceof Error ? unregisterError.message : 'Désinscription impossible.',
        { title: 'Tournoi' },
      );
    }
  };

  if (isLoading) {
    return (
      <DefisPageShell title="Tournoi">
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      </DefisPageShell>
    );
  }

  if (isError) {
    return (
      <DefisPageShell title="Tournoi">
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'Impossible de charger ce tournoi.'}
        </Text>
      </DefisPageShell>
    );
  }

  if (!data) {
    return (
      <DefisPageShell title="Tournoi">
        <Text style={styles.errorText}>Tournoi introuvable.</Text>
      </DefisPageShell>
    );
  }

  const isOpen = data.status === 'scheduled';
  const isLive = data.status === 'live';
  const isDone = data.status === 'completed';

  return (
    <DefisPageShell title="Tournoi">
      {!isOnline ? (
        <Text style={styles.offlineHint}>Données en cache — reconnectez-vous pour actualiser.</Text>
      ) : null}

      <CompetitionHeroBanner
        competition={data}
        subtitle={data.categoryName ? `Catégorie · ${data.categoryName}` : 'Toutes catégories'}
      />

      <DefisSurfaceCard style={styles.perksCard}>
        <Text style={styles.perksTitle}>À savoir</Text>
        <Text style={styles.perkLine}>✓ Gratuit · Résultats en direct</Text>
        <Text style={styles.perkLine}>✓ Bracket élimination directe</Text>
        {data.rewardText ? <Text style={styles.perkLine}>🎁 {data.rewardText} à gagner</Text> : null}
      </DefisSurfaceCard>

      {isOpen && !data.isRegistered ? (
        <Pressable style={styles.ctaWrap} onPress={() => void onRegister()}>
          <LinearGradient
            colors={[COLORS.primaryDark, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Rejoindre le tournoi</Text>
          </LinearGradient>
        </Pressable>
      ) : null}

      {isOpen && data.isRegistered ? (
        <DefisSurfaceCard style={styles.registeredCard}>
          <Text style={styles.registeredTitle}>✓ Vous êtes inscrit</Text>
          <Text style={styles.registeredHint}>
            Le bracket sera disponible dès le lancement du tournoi. Restez prêt !
          </Text>
          <Pressable onPress={() => void onUnregister()}>
            <Text style={styles.unlink}>Se désinscrire</Text>
          </Pressable>
        </DefisSurfaceCard>
      ) : null}

      {isLive ? (
        <>
          <LinearGradient
            colors={['#FFF8E7', '#FFF3D6']}
            style={styles.matchCard}
          >
            <Text style={styles.matchEyebrow}>⚡ Match en cours</Text>
            <Text style={styles.matchTitle}>Mon prochain match</Text>
            <Text style={styles.matchMeta}>
              Jouez quand vous voulez avant la fin du tournoi. Chaque victoire vous rapproche du
              titre.
            </Text>
            <Pressable style={styles.matchCta}>
              <Text style={styles.matchCtaText}>Jouer mon match →</Text>
            </Pressable>
          </LinearGradient>
          <Pressable
            style={styles.bracketLink}
            onPress={() => router.push(DefisRoutes.tournoiBracket(competitionId))}
          >
            <Text style={styles.bracketLinkText}>Voir le bracket complet →</Text>
          </Pressable>
        </>
      ) : null}

      {isDone ? (
        <Pressable
          style={styles.bracketLink}
          onPress={() => router.push(DefisRoutes.tournoiBracket(competitionId))}
        >
          <Text style={styles.bracketLinkText}>Voir le podium & le bracket final →</Text>
        </Pressable>
      ) : null}
    </DefisPageShell>
  );
}

const styles = StyleSheet.create({
  loader: { marginVertical: 32 },
  offlineHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.info,
    marginBottom: 4,
  },
  perksCard: {
    gap: 8,
    backgroundColor: '#FAFAFA',
  },
  perksTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  perkLine: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  ctaWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.textLight,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  registeredCard: {
    gap: 8,
    borderColor: COLORS.success,
    borderWidth: 1.5,
  },
  registeredTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.success,
    fontSize: 17,
  },
  registeredHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  unlink: {
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.error,
    fontSize: 13,
    marginTop: 4,
  },
  matchCard: {
    borderRadius: 18,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  matchEyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matchTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  matchMeta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  matchCta: {
    marginTop: 6,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  matchCtaText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textLight,
    fontSize: 15,
  },
  bracketLink: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
  },
  bracketLinkText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.primaryDark,
    fontSize: 14,
  },
  errorText: {
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});
