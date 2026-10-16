import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { bodyText, titleText } from '@constants/appText';
import { Colors } from '@constants/Colors';
import { Routes } from '@constants/Routes';

import { PREMIUM_PLANS } from './premiumCopy';
import { PremiumCta, PremiumScaffold } from './premiumUi';

export default function ChoosePlanScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<(typeof PREMIUM_PLANS)[number]['id']>('plan_12m');
  const plan = PREMIUM_PLANS.find((item) => item.id === selected) ?? PREMIUM_PLANS[1];

  return (
    <PremiumScaffold
      title="Plans"
      onBack={() => router.back()}
      footer={
        <PremiumCta
          label="Continuer"
          onPress={() => router.push({ pathname: Routes.PREMIUM_PAYMENT, params: { plan: plan.id } })}
        />
      }
    >
      <Text style={styles.lead}>Même carnet, mêmes badges. L’annuel offre deux mois et trois gels de série.</Text>
      {PREMIUM_PLANS.map((item) => {
        const active = item.id === selected;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => setSelected(item.id)}
            style={[styles.plan, active && styles.planOn]}
          >
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.hint}>{item.hint}</Text>
          </Pressable>
        );
      })}
    </PremiumScaffold>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: 14, ...bodyText, color: Colors.textSecondary, lineHeight: 20 },
  plan: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 4,
  },
  planOn: { borderColor: Colors.primary, backgroundColor: Colors.premiumSurface },
  label: { fontSize: 16, ...titleText, color: Colors.textPrimary },
  price: { fontSize: 20, ...titleText, color: Colors.primary },
  hint: { fontSize: 13, ...bodyText, color: Colors.textSecondary },
});
