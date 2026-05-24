import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { CountdownTimer } from '@components/atoms/CountdownTimer';
import { COLORS } from '@constants/Colors';
import type { CompetitionSummary } from '@app-types/challenge.types';

const STATUS_LABELS: Record<CompetitionSummary['status'], string> = {
  draft: 'Brouillon',
  scheduled: 'Inscriptions ouvertes',
  live: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

interface CompetitionHeroBannerProps {
  competition: Pick<
    CompetitionSummary,
    'title' | 'status' | 'registeredCount' | 'maxParticipants' | 'rewardText' | 'startsAt' | 'endsAt'
  >;
  subtitle?: string;
}

export function CompetitionHeroBanner({ competition, subtitle }: CompetitionHeroBannerProps) {
  const countdownTarget =
    competition.status === 'scheduled'
      ? competition.startsAt
      : competition.status === 'live'
        ? competition.endsAt
        : null;

  return (
    <LinearGradient
      colors={['#1A1A2E', '#252547']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.topRow}>
        <Text style={styles.trophy}>🏆</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{STATUS_LABELS[competition.status]}</Text>
        </View>
      </View>

      <Text style={styles.title}>{competition.title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statValue}>
            {competition.registeredCount}/{competition.maxParticipants}
          </Text>
          <Text style={styles.statLabel}>Inscrits</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statValue}>⚔️</Text>
          <Text style={styles.statLabel}>Élim. directe</Text>
        </View>
        {competition.rewardText ? (
          <View style={[styles.statChip, styles.statChipWide]}>
            <Text style={styles.statValue} numberOfLines={1}>
              🎁 {competition.rewardText}
            </Text>
            <Text style={styles.statLabel}>Récompense</Text>
          </View>
        ) : null}
      </View>

      {countdownTarget ? (
        <View style={styles.countdownBox}>
          <Text style={styles.countdownLabel}>
            {competition.status === 'scheduled' ? 'Début dans' : 'Se termine dans'}
          </Text>
          <CountdownTimer endsAt={countdownTarget} light showPrefix={false} />
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 20,
    padding: 20,
    gap: 12,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trophy: {
    fontSize: 28,
  },
  statusPill: {
    backgroundColor: 'rgba(245, 166, 35, 0.25)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.5)',
  },
  statusText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: '#FFD54A',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    color: '#FFFFFF',
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  statChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 88,
    gap: 2,
  },
  statChipWide: {
    flex: 1,
    minWidth: 120,
  },
  statValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  countdownBox: {
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
  },
  countdownLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
});
