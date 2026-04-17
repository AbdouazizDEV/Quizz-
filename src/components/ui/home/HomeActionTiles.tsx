import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function HomeActionTiles() {
  return (
    <View style={styles.twoColsSection}>
      <Pressable style={({ pressed }) => [styles.actionTile, styles.friendTile, pressed && styles.pressed]}>
        <Feather name="users" size={21} color="#10173B" />
        <Text style={styles.actionTitle}>Défier un ami</Text>
        <Text style={styles.actionSubtitle}>Lance un duel en temps réel</Text>
      </Pressable>
      <Pressable style={({ pressed }) => [styles.actionTile, styles.tournamentTile, pressed && styles.pressed]}>
        <Feather name="target" size={21} color="#10173B" />
        <Text style={styles.actionTitle}>Participer à un tournoi</Text>
        <Text style={styles.actionSubtitle}>Entre dans la ligue hebdo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  twoColsSection: {
    flexDirection: 'row',
    gap: 10,
  },
  actionTile: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    minHeight: 118,
    justifyContent: 'space-between',
  },
  friendTile: {
    backgroundColor: '#F4D03F',
  },
  tournamentTile: {
    backgroundColor: '#FFD884',
  },
  actionTitle: {
    color: '#121631',
    fontSize: 16,
    fontWeight: '800',
  },
  actionSubtitle: {
    color: '#1F2D57',
    fontSize: 13,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
