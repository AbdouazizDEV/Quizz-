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

import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisTabSwitcher } from '@components/ui/defis/DefisTabSwitcher';
import { DefisRoutes } from '@constants/defisRoutes';
import { COLORS } from '@constants/Colors';
import { useAuthMe } from '@hooks/useAuthMe';
import type { CompetitionSummary } from '@app-types/challenge.types';
import {
  fetchCompetitionsByTab,
  registerForCompetition,
} from '@services/defis/competitionRepository';

type TournoiTab = 'inscriptions' | 'en_cours' | 'fin';

const TABS = [
  { id: 'inscriptions' as const, label: 'Inscriptions' },
  { id: 'en_cours' as const, label: 'En cours' },
  { id: 'fin' as const, label: 'Fin' },
];

export default function TournoiListScreen() {
  const [tab, setTab] = useState<TournoiTab>('inscriptions');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['competitions', tab, userId],
    queryFn: () => fetchCompetitionsByTab(tab, userId),
    enabled: Boolean(userId),
  });

  const onRegister = async (competition: CompetitionSummary) => {
    if (!userId) return;
    if (competition.registeredCount >= competition.maxParticipants) {
      Alert.alert('Tournoi', 'Ce tournoi est complet.');
      return;
    }
    try {
      await registerForCompetition(userId, competition.id);
      await queryClient.invalidateQueries({ queryKey: ['competitions'] });
      Alert.alert('Tournoi', '✓ Vous êtes inscrit !');
    } catch (error) {
      Alert.alert('Tournoi', error instanceof Error ? error.message : 'Inscription impossible.');
    }
  };

  return (
    <DefisPageShell title="Tournois">
      <DefisTabSwitcher tabs={TABS} activeTab={tab} onChange={setTab} />
      {isLoading ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : null}
      {(data ?? []).map((competition, index) => (
        <TournoiCard
          key={competition.id}
          competition={competition}
          index={index}
          tab={tab}
          onPress={() => router.push(DefisRoutes.tournoiDetail(competition.id))}
          onRegister={() => void onRegister(competition)}
        />
      ))}
      {!isLoading && (data?.length ?? 0) === 0 ? (
        <Text style={styles.empty}>Aucun tournoi dans cette catégorie.</Text>
      ) : null}
    </DefisPageShell>
  );
}

function TournoiCard({
  competition,
  index,
  tab,
  onPress,
  onRegister,
}: {
  competition: CompetitionSummary;
  index: number;
  tab: TournoiTab;
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
        <Text style={styles.title}>🏆 {competition.title}</Text>
        <Text style={styles.meta}>
          {competition.categoryName ? `Catégorie : ${competition.categoryName}` : 'Toutes catégories'}
        </Text>
        <Text style={styles.meta}>
          👥 {competition.registeredCount} / {competition.maxParticipants} inscrits
          {isFull ? ' ✓' : ''}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, fillRatio * 100)}%` }]} />
        </View>
        {competition.startsAt ? (
          <Text style={styles.date}>
            📅 {tab === 'inscriptions' ? 'Inscriptions jusqu\'au' : 'Commence le'}{' '}
            {formatDate(competition.startsAt)}
          </Text>
        ) : null}
        {canRegister ? (
          <Pressable style={styles.cta} onPress={(e) => { e.stopPropagation?.(); onRegister(); }}>
            <Text style={styles.ctaText}>S&apos;inscrire →</Text>
          </Pressable>
        ) : null}
        {competition.isRegistered && tab === 'inscriptions' ? (
          <Text style={styles.registered}>✓ Vous êtes inscrit</Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const styles = StyleSheet.create({
  loader: { marginVertical: 24 },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  meta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  date: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
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
});
