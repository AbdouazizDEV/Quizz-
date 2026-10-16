import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { bodyText, titleText } from '@constants/appText';
import { Colors } from '@constants/Colors';
import { Routes } from '@constants/Routes';
import { invalidateAuthMeCache } from '@services/auth/authMeRepository';
import { createPremiumCheckout, fetchPremiumPayment, readApiError, type PaidPlanId } from '@services/payments/paymentsRepository';

import { PREMIUM_PLANS } from './premiumCopy';
import { PremiumCard, PremiumCta, PremiumScaffold } from './premiumUi';

export default function SelectPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ plan?: string }>();
  const plan = PREMIUM_PLANS.find((item) => item.id === params.plan) ?? PREMIUM_PLANS[0];
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const pay = async () => {
    setPending(true);
    setError(null);
    try {
      const checkout = await createPremiumCheckout(plan.id as PaidPlanId);
      const watch = pollPayment(checkout.reference);
      await WebBrowser.openBrowserAsync(checkout.url);
      const status = await watch;
      if (status === 'success') {
        await invalidateAuthMeCache();
        router.replace({ pathname: Routes.PREMIUM_SUCCESS, params: { reference: checkout.reference } });
        return;
      }
      setError(status === 'failed' ? 'Le paiement n’a pas abouti.' : 'Le paiement n’est pas encore confirmé. Rouvre cette page après le retour Payfonte.');
    } catch (reason) {
      setError(readApiError(reason, 'Le paiement n’a pas pu démarrer.'));
    } finally {
      setPending(false);
    }
  };

  return (
    <PremiumScaffold
      title="Paiement"
      onBack={() => router.back()}
      footer={<PremiumCta label={pending ? 'Ouverture de Payfonte…' : `Payer ${plan.price}`} onPress={() => void pay()} disabled={pending} />}
    >
      <PremiumCard>
        <Text style={styles.label}>{plan.label}</Text>
        <Text style={styles.price}>{plan.price}</Text>
        <Text style={styles.hint}>{plan.hint}</Text>
      </PremiumCard>
      <Text style={styles.lead}>Wave, Orange Money ou Mixx : le choix se fait sur la page Payfonte. Aucun argent réel en sandbox.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </PremiumScaffold>
  );
}

async function pollPayment(reference: string): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await wait(attempt === 0 ? 1500 : 2000);
    try {
      const payment = await fetchPremiumPayment(reference);
      if (payment.status === 'success' || payment.status === 'failed') return payment.status;
    } catch {
      // Le navigateur est encore ouvert : on réessaie.
    }
  }
  return 'pending';
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const styles = StyleSheet.create({
  label: { fontSize: 16, ...titleText, color: Colors.textSecondary },
  price: { fontSize: 28, ...titleText, color: Colors.textPrimary },
  hint: { fontSize: 14, ...bodyText, color: Colors.textSecondary },
  lead: { fontSize: 14, ...bodyText, color: Colors.textSecondary, lineHeight: 20 },
  error: { color: Colors.danger, ...titleText, lineHeight: 20 },
});
