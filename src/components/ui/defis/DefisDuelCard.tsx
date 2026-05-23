import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';

interface DefisDuelCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  onPress?: () => void;
}

export function DefisDuelCard({ title, description, ctaLabel, onPress }: DefisDuelCardProps) {
  return (
    <DefisSurfaceCard>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable style={styles.cta} onPress={onPress} accessibilityRole="button">
        <Text style={styles.ctaText}>{ctaLabel}</Text>
        <Feather name="chevron-right" size={18} color="#10173B" />
      </Pressable>
    </DefisSurfaceCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#616161',
    marginBottom: 14,
  },
  cta: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10173B',
  },
});
