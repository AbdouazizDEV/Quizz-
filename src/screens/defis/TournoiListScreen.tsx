import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisTabSwitcher } from '@components/ui/defis/DefisTabSwitcher';
import { DefisRoutes } from '@constants/defisRoutes';
import { COLORS } from '@constants/Colors';
import { useAuthMe } from '@hooks/useAuthMe';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import type { CompetitionSummary } from '@app-types/challenge.types';
import {
  fetchCompetitionsByTab,
  registerForCompetition,
} from '@services/defis/competitionRepository';
import { useAppError } from '@providers/AppErrorProvider';

type TournoiTab = 'inscriptions' | 'en_cours' | 'fin';

const TABS = [
  { id: 'inscriptions' as const, label: 'Inscriptions' },
  { id: 'en_cours' as const, label: 'En cours' },
  { id: 'fin' as const, label: 'Terminés' },
];

const TAB_STATUS: Record<TournoiTab, string> = {
  inscriptions: 'Inscriptions ouvertes',
  en_cours: 'En cours',
  fin: 'Terminé',
};

export default function TournoiListScreen() {
  const [tab, setTab] = useState<TournoiTab>('inscriptions');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAppError } = useAppError();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';
  const { isOnline } = useNetworkStatus();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['competitions', tab, userId],
    queryFn: () => fetchCompetitionsByTab(tab, userId),
    enabled: Boolean(userId),
  });

  const onRegister = async (competition: CompetitionSummary) => {
    if (!userId) return;
    if (competition.registeredCount >= competition.maxParticipants) {
      showAppError('Ce tournoi a atteint le nombre maximum de participants.', {
        title: 'Tournoi complet',
      });
      return;
    }
    try {
      const result = await registerForCompetition(userId, competition.id);
      await queryClient.invalidateQueries({ queryKey: ['competitions'] });
      Alert.alert(
        'Tournoi',
        result.queued
          ? '✓ Inscription enregistrée — synchronisation à la reconnexion.'
          : '✓ Vous êtes inscrit !',
      );
    } catch (error) {
      showAppError(
        error instanceof Error ? error.message : 'Inscription impossible.',
        { title: 'Tournoi' },
      );
    }
  };

  return (
    <DefisPageShell title="Tournois">
      <LinearGradient
        colors={['#1A1A2E', '#252547']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBanner}
      >
        <Text style={styles.headerEmoji}>🏆</Text>
        <Text style={styles.headerTitle}>Arène des tournois</Text>
        <Text style={styles.headerSubtitle}>
          Affrontez la communauté · Brackets · Récompenses
        </Text>
      </LinearGradient>

      <DefisTabSwitcher tabs={TABS} activeTab={tab} onChange={setTab} />
      {isLoading ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : null}
      {!isOnline && (data?.length ?? 0) > 0 ? (
        <Text style={styles.offlineHint}>Données en cache — reconnectez-vous pour actualiser.</Text>
      ) : null}
      {(data ?? []).map((competition, index) => (
        <TournoiCard
          key={competition.id}
          competition={competition}
          index={index}
          tab={tab}
          statusLabel={TAB_STATUS[tab]}
          onPress={() => router.push(DefisRoutes.tournoiDetail(competition.id))}
          onRegister={() => void onRegister(competition)}
        />
      ))}
      {!isLoading && isError ? (
        <Text style={styles.empty}>
          {error instanceof Error ? error.message : 'Impossible de charger les tournois.'}
        </Text>
      ) : null}
      {!isLoading && !isError && (data?.length ?? 0) === 0 ? (
        <Text style={styles.empty}>Aucun tournoi dans cette catégorie.</Text>
      ) : null}
    </DefisPageShell>
  );
}

function TournoiCard({
  competition,
  index,
  tab,
  statusLabel,
  onPress,
  onRegister,
}: {
  competition: CompetitionSummary;
  index: number;
  tab: TournoiTab;
  statusLabel: string;
  onPress: () => void;
  onRegister: () => void;
}) {
  const fillRatio = competition.maxParticipants
    ? competition.registeredCount / competition.maxParticipants
    : 0;
  const isFull = competition.registeredCount >= competition.maxParticipants;
  const canRegister = tab === 'inscriptions' && !competition.isRegistered && !isFull;

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <Pressable style={styles.card} onPress={onPress}>
        <View style={styles.cardAccent} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.title} numberOfLines={2}>
              {competition.title}
            </Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={styles.meta}>
            {competition.categoryName ? competition.categoryName : 'Toutes catégories'}
          </Text>
          <View style={styles.participantsRow}>
            <Text style={styles.participantsLabel}>👥 Participants</Text>
            <Text style={styles.participantsValue}>
              {competition.registeredCount} / {competition.maxParticipants}
              {isFull ? ' · Complet' : ''}
            </Text>
          </View>
          <View style={styles.track}>
            <LinearGradient
              colors={[COLORS.primaryDark, COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.fill, { width: `${Math.min(100, fillRatio * 100)}%` }]}
            />
          </View>
          {competition.startsAt ? (
            <Text style={styles.date}>
              📅 {tab === 'inscriptions' ? 'Inscriptions jusqu\'au' : 'Commence le'}{' '}
              {formatDate(competition.startsAt)}
            </Text>
          ) : null}
          {competition.rewardText ? (
            <Text style={styles.reward} numberOfLines={1}>
              🎁 {competition.rewardText}
            </Text>
          ) : null}
          {canRegister ? (
            <Pressable
              style={styles.cta}
              onPress={(e) => {
                e.stopPropagation?.();
                onRegister();
              }}
            >
              <Text style={styles.ctaText}>Rejoindre →</Text>
            </Pressable>
          ) : null}
          {competition.isRegistered && tab === 'inscriptions' ? (
            <Text style={styles.registered}>✓ Inscrit — bonne chance !</Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const styles = StyleSheet.create({
  loader: { marginVertical: 24 },
  headerBanner: {
    borderRadius: 18,
    padding: 18,
    gap: 6,
    marginBottom: 4,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 18,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#10173B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardAccent: {
    width: 5,
    backgroundColor: COLORS.primary,
  },
  cardBody: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  statusPill: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
  },
  statusPillText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  meta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  participantsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  participantsValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  date: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  reward: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.primaryDark,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 2,
  },
  ctaText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textLight,
    fontSize: 13,
  },
  registered: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.success,
    fontSize: 13,
  },
  empty: {
    textAlign: 'center',
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
    marginTop: 24,
  },
  offlineHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.info,
    marginBottom: 8,
  },
});
