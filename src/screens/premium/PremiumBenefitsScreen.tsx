import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { bodyText, titleText } from '@constants/appText';
import { Colors } from '@constants/Colors';
import { Routes } from '@constants/Routes';

import { PREMIUM_BENEFITS } from './premiumCopy';
import { PremiumCard, PremiumCta, PremiumScaffold } from './premiumUi';

export default function PremiumBenefitsScreen() {
  const router = useRouter();
  return (
    <PremiumScaffold
      title="Quizz+ Premium"
      onBack={() => router.back()}
      footer={
        <View style={styles.footer}>
          <PremiumCta label="Voir les plans" onPress={() => router.push(Routes.PREMIUM_PLANS)} />
          <Pressable accessibilityRole="button" onPress={() => router.push(Routes.PREMIUM_COMPARE)}>
            <Text style={styles.link}>Comparer Gratuit / Premium</Text>
          </Pressable>
        </View>
      }
    >
      <PremiumCard>
        <Text style={styles.hero}>Entraîne-toi mieux. Le classement reste le même.</Text>
        <Text style={styles.body}>Le Premium donne des outils pour comprendre tes erreurs. Il n’ajoute aucun point.</Text>
      </PremiumCard>
      {PREMIUM_BENEFITS.map((item) => (
        <PremiumCard key={item.title}>
          <View style={styles.row}>
            <View style={styles.icon}>
              <Feather name={item.icon} size={18} color={Colors.secondary} />
            </View>
            <View style={styles.text}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </View>
        </PremiumCard>
      ))}
    </PremiumScaffold>
  );
}

const styles = StyleSheet.create({
  footer: { gap: 10 },
  hero: { fontSize: 22, ...titleText, color: Colors.textPrimary, lineHeight: 28 },
  title: { fontSize: 16, ...titleText, color: Colors.textPrimary },
  body: { fontSize: 14, ...bodyText, color: Colors.textSecondary, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  text: { flex: 1, gap: 4 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 166, 35, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { textAlign: 'center', color: Colors.primary, ...titleText, fontSize: 15 },
});
