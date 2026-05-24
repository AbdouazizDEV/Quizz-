import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';

import { CompetitionHeroBanner } from '@components/ui/defis/CompetitionHeroBanner';
import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { COLORS } from '@constants/Colors';
import { useAuthMe } from '@hooks/useAuthMe';
import { fetchCompetitionById } from '@services/defis/competitionRepository';

/** Bracket horizontal simplifié — données complètes branchées quand la table matchs existera. */
export default function TournoiBracketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const competitionId = typeof id === 'string' ? id : '';
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id ?? '';

  const { data: competition, isLoading, isError } = useQuery({
    queryKey: ['competition', competitionId, userId],
    queryFn: () => fetchCompetitionById(competitionId, userId),
    enabled: Boolean(competitionId && userId),
  });

  return (
    <DefisPageShell title="Bracket">
      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : isError || !competition ? (
        <Text style={styles.errorText}>Impossible de charger ce bracket.</Text>
      ) : (
        <>
          <CompetitionHeroBanner
            competition={competition}
            subtitle="Arbre du tournoi · élimination directe"
          />

          <View style={styles.legendRow}>
            <LegendDot color={COLORS.success} label="Qualifié" />
            <LegendDot color={COLORS.primary} label="En cours" />
            <LegendDot color={COLORS.border} label="À venir" />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            <BracketRound title="1/8" matches={['Aminata', 'Moussa', 'Vous', 'Ibrahima']} status="done" />
            <RoundConnector />
            <BracketRound title="1/4" matches={['Aminata', '—']} status="live" highlightUser />
            <RoundConnector />
            <BracketRound title="Demi" matches={['—']} status="future" />
            <RoundConnector />
            <BracketRound title="Finale" matches={['—']} status="future" isFinal />
          </ScrollView>

          <Text style={styles.demoHint}>
            Bracket de démonstration — les vrais matchs apparaîtront ici une fois les rencontres
            générées.
          </Text>
        </>
      )}
    </DefisPageShell>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function RoundConnector() {
  return (
    <View style={styles.connector}>
      <View style={styles.connectorLine} />
      <Text style={styles.connectorArrow}>›</Text>
    </View>
  );
}

function BracketRound({
  title,
  matches,
  status,
  highlightUser = false,
  isFinal = false,
}: {
  title: string;
  matches: string[];
  status: 'done' | 'live' | 'lost' | 'future';
  highlightUser?: boolean;
  isFinal?: boolean;
}) {
  const accentColor =
    status === 'done'
      ? COLORS.success
      : status === 'live'
        ? COLORS.primary
        : status === 'lost'
          ? COLORS.error
          : '#CBD5E1';

  return (
    <View style={styles.round}>
      <LinearGradient
        colors={isFinal ? ['#1A1A2E', '#2D2D5A'] : ['#F5F5F7', '#FFFFFF']}
        style={[styles.roundHeader, isFinal && styles.roundHeaderFinal]}
      >
        <Text style={[styles.roundTitle, isFinal && styles.roundTitleFinal]}>
          {isFinal ? '🏆 ' : ''}
          {title}
        </Text>
      </LinearGradient>
      {matches.map((name) => {
        const isUser = name === 'Vous';
        const isPlaceholder = name === '—';
        return (
          <View
            key={`${title}-${name}`}
            style={[
              styles.slot,
              { borderLeftColor: accentColor },
              isUser && highlightUser && styles.slotUser,
              isFinal && styles.slotFinal,
            ]}
          >
            <Text
              style={[
                styles.slotText,
                status === 'lost' && styles.slotLost,
                isPlaceholder && styles.slotPlaceholder,
                isFinal && !isPlaceholder && styles.slotTextFinal,
              ]}
            >
              {isPlaceholder ? 'En attente' : name}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginVertical: 32 },
  errorText: {
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  scroll: {
    gap: 4,
    paddingVertical: 16,
    paddingRight: 8,
  },
  connector: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  connectorLine: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.border,
    borderRadius: 1,
  },
  connectorArrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: COLORS.primaryDark,
    marginTop: -8,
  },
  round: {
    gap: 8,
    minWidth: 132,
  },
  roundHeader: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roundHeaderFinal: {
    borderColor: 'rgba(245, 166, 35, 0.45)',
  },
  roundTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  roundTitleFinal: {
    color: '#FFD54A',
  },
  slot: {
    borderLeftWidth: 4,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#10173B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  slotUser: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  slotFinal: {
    minHeight: 52,
    justifyContent: 'center',
  },
  slotText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  slotTextFinal: {
    fontSize: 15,
  },
  slotLost: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  slotPlaceholder: {
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  demoHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
});
