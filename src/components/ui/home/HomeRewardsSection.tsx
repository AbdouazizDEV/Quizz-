import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function HomeRewardsSection() {
  return (
    <LinearGradient colors={['#231F57', '#202A7D']} style={styles.rewardsCard}>
      <View style={styles.rewardsTop}>
        <View>
          <Text style={styles.rewardsTitle}>Niveau Maître en cours</Text>
          <Text style={styles.rewardsSubtitle}>Encore 360 pts pour débloquer ton badge violet.</Text>
        </View>
        <Feather name="gift" size={24} color="#F5D24A" />
      </View>
      <Pressable style={styles.rewardsBtn}>
        <Text style={styles.rewardsBtnText}>Voir mes récompenses</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  rewardsCard: {
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  rewardsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rewardsTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  rewardsSubtitle: {
    color: '#CFD5F9',
    fontSize: 14,
    lineHeight: 19,
    maxWidth: 250,
    marginTop: 4,
  },
  rewardsBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  rewardsBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
