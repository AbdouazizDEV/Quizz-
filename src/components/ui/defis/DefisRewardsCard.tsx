import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface DefisRewardsCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  onPress?: () => void;
}

export function DefisRewardsCard({ title, description, ctaLabel, onPress }: DefisRewardsCardProps) {
  return (
    <LinearGradient colors={['#231F57', '#202A7D']} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <Feather name="gift" size={24} color="#F5D24A" />
      </View>
      <Pressable style={styles.cta} onPress={onPress} accessibilityRole="button">
        <Text style={styles.ctaText}>{ctaLabel}</Text>
        <Feather name="chevron-right" size={18} color="#FFFFFF" />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  textBlock: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    color: '#CFD5F9',
    fontSize: 14,
    lineHeight: 20,
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
