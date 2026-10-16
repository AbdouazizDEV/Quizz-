import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { bodyText, mutedText, titleText } from '@constants/appText';
import { Colors } from '@constants/Colors';
import { Routes } from '@constants/Routes';

import { PREMIUM_COMPARE } from './premiumCopy';
import { PremiumCta, PremiumScaffold } from './premiumUi';

export default function ComparePlansScreen() {
  const router = useRouter();
  return (
    <PremiumScaffold
      title="Comparer"
      onBack={() => router.back()}
      footer={<PremiumCta label="Choisir un plan" onPress={() => router.push(Routes.PREMIUM_PLANS)} />}
    >
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={[styles.label, styles.head]} />
          <Text style={styles.head}>Gratuit</Text>
          <Text style={styles.head}>Premium</Text>
        </View>
        {PREMIUM_COMPARE.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Mark on={row.free} />
            <Mark on={row.premium} premium />
          </View>
        ))}
      </View>
    </PremiumScaffold>
  );
}

function Mark({ on, premium }: { on: boolean; premium?: boolean }) {
  if (!on) return <Text style={styles.dash}>—</Text>;
  return <Feather name="check" size={18} color={premium ? '#543ACC' : '#2E7D32'} />;
}

const styles = StyleSheet.create({
  table: { backgroundColor: Colors.surface, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, padding: 12, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { flex: 1, color: Colors.textPrimary, fontSize: 14, ...bodyText },
  head: { width: 72, textAlign: 'center', ...titleText, color: Colors.textPrimary },
  dash: { width: 72, textAlign: 'center', color: Colors.textMuted, fontSize: 16, ...mutedText },
});
