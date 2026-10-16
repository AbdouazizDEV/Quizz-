import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { bodyText, titleText } from '@constants/appText';
import { Colors } from '@constants/Colors';
import { Routes } from '@constants/Routes';
import { invalidateAuthMeCache } from '@services/auth/authMeRepository';
import { fetchPremiumPayment } from '@services/payments/paymentsRepository';

import { PremiumCard, PremiumCta, PremiumScaffold } from './premiumUi';

export default function PremiumSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reference?: string }>();
  const reference = typeof params.reference === 'string' ? params.reference : '';
  const [status, setStatus] = useState(reference ? 'pending' : 'missing');

  useEffect(() => {
    if (!reference) return undefined;
    let stopped = false;
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const payment = await fetchPremiumPayment(reference);
        if (stopped) return;
        setStatus(payment.status);
        if (payment.status === 'success') {
          await invalidateAuthMeCache();
          return;
        }
        if (payment.status === 'failed' || attempts >= 8) return;
      } catch {
        if (attempts >= 8) {
          setStatus('failed');
          return;
        }
      }
      if (!stopped && attempts < 8) setTimeout(() => void poll(), 2000);
    };
    void poll();
    return () => {
      stopped = true;
    };
  }, [reference]);

  const confirmed = status === 'success';
  const waiting = status === 'pending';
  const title = confirmed ? 'Bienvenue en Premium' : waiting ? 'Vérification du paiement' : 'Paiement non confirmé';
  const text = confirmed
    ? 'Le paiement est confirmé. Le carnet, les badges et les outils d’entraînement sont actifs.'
    : waiting
      ? 'Payfonte confirme encore le paiement.'
      : 'Le retour sur cette page n’active pas le premium. Réessaie depuis les tarifs si le paiement n’a pas abouti.';

  return (
    <PremiumScaffold
      title="Premium"
      onBack={() => router.replace(Routes.PROFILE)}
      footer={
        <PremiumCta
          label={confirmed ? 'Ouvrir le carnet' : 'Retour aux tarifs'}
          onPress={() => router.replace(confirmed ? Routes.CARNET : Routes.PREMIUM_PLANS)}
        />
      }
    >
      <PremiumCard>
        <Feather name={confirmed ? 'check-circle' : 'info'} size={36} color={Colors.primary} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{text}</Text>
      </PremiumCard>
    </PremiumScaffold>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, ...titleText, color: Colors.textPrimary },
  body: { fontSize: 15, ...bodyText, color: Colors.textSecondary, lineHeight: 22 },
});
