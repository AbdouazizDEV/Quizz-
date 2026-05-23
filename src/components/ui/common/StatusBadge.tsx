import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@constants/Colors';

export type StatusBadgeVariant = 'en_cours' | 'rapide' | 'termine' | 'default';

interface StatusBadgeProps {
  status: StatusBadgeVariant;
  label?: string;
  pulse?: boolean;
}

const LABELS: Record<StatusBadgeVariant, string> = {
  en_cours: 'En cours',
  rapide: 'Rapide',
  termine: 'Terminé',
  default: '',
};

export function StatusBadge({ status, label, pulse = false }: StatusBadgeProps) {
  const text = label ?? LABELS[status];

  return (
    <View style={[styles.badge, pulse && styles.pulse]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  pulse: {
    opacity: 0.95,
  },
  text: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: COLORS.primary,
  },
});
