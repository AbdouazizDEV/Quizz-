import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORS } from '@constants/Colors';

interface DuelViewAllLinkProps {
  totalCount: number;
  visibleCount: number;
  onPress: () => void;
}

export function DuelViewAllLink({ totalCount, visibleCount, onPress }: DuelViewAllLinkProps) {
  if (totalCount <= visibleCount) return null;

  return (
    <Pressable
      style={styles.link}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Voir tout (${totalCount})`}
    >
      <Text style={styles.label}>Voir tout ({totalCount}) →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.primary,
  },
});
