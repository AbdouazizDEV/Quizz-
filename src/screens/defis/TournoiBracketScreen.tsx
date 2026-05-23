import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { COLORS } from '@constants/Colors';

/** Bracket horizontal simplifié — données complètes branchées quand la table matchs existera. */
export default function TournoiBracketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <DefisPageShell title="Bracket">
      <Text style={styles.hint}>Tournoi {id}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <BracketRound title="1/8" matches={['Aminata', 'Moussa', 'Vous', 'Ibrahima']} status="done" />
        <BracketRound title="1/4" matches={['Aminata', '?']} status="live" highlightUser />
        <BracketRound title="Demi" matches={['?']} status="future" />
        <BracketRound title="Finale" matches={['?????']} status="future" />
      </ScrollView>
    </DefisPageShell>
  );
}

function BracketRound({
  title,
  matches,
  status,
  highlightUser = false,
}: {
  title: string;
  matches: string[];
  status: 'done' | 'live' | 'lost' | 'future';
  highlightUser?: boolean;
}) {
  const borderColor =
    status === 'done'
      ? COLORS.success
      : status === 'live'
        ? COLORS.primary
        : status === 'lost'
          ? COLORS.error
          : COLORS.border;

  return (
    <View style={styles.round}>
      <Text style={styles.roundTitle}>{title}</Text>
      {matches.map((name) => {
        const isUser = name === 'Vous';
        return (
          <View
            key={`${title}-${name}`}
            style={[
              styles.slot,
              { borderColor },
              (isUser || highlightUser) && name === 'Vous' && styles.slotUser,
            ]}
          >
            <Text style={[styles.slotText, status === 'lost' && styles.slotLost]}>{name}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  scroll: {
    gap: 16,
    paddingVertical: 12,
  },
  round: {
    gap: 10,
    minWidth: 120,
  },
  roundTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  slot: {
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.cardBackground,
  },
  slotUser: {
    backgroundColor: COLORS.primaryLight,
  },
  slotText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  slotLost: {
    color: COLORS.textSecondary,
  },
});
