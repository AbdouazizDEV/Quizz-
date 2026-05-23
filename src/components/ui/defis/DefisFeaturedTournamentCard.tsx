import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface DefisFeaturedTournamentCardProps {
  eyebrow: string;
  title: string;
  statusLabel: string;
  formatHint: string;
  ctaLabel: string;
  onPress?: () => void;
}

export function DefisFeaturedTournamentCard({
  eyebrow,
  title,
  statusLabel,
  formatHint,
  ctaLabel,
  onPress,
}: DefisFeaturedTournamentCardProps) {
  return (
    <LinearGradient colors={['#F3F6FF', '#E6ECFF']} style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.metaList}>
        <View style={styles.metaRow}>
          <Feather name="clock" size={15} color="#2A3E8C" />
          <Text style={styles.metaText}>{statusLabel}</Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="award" size={15} color="#2A3E8C" />
          <Text style={styles.metaText}>{formatHint}</Text>
        </View>
      </View>
      <Pressable style={styles.cta} onPress={onPress} accessibilityRole="button">
        <Text style={styles.ctaText}>{ctaLabel}</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(32, 42, 125, 0.12)',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#4B5AA8',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#121631',
    lineHeight: 28,
  },
  metaList: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#2A3E8C',
  },
  cta: {
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: '#202A7D',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
