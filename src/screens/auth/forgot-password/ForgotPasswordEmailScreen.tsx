import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UnderlineLabeledField } from '@components/ui/auth/UnderlineLabeledField';
import { OnboardingContinueBar } from '@components/ui/onboarding/OnboardingContinueBar';
import { ForgotPasswordFlowTheme } from '@constants/forgotPasswordFlowTheme';
import { onboardingColumn } from '@constants/layout';
import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { passwordResetGateway } from '@services/passwordReset/passwordResetGatewayInstance';

const FOOTER_RESERVE = 132;
const GAP_BLOCK = 24;

export default function ForgotPasswordEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string }>();
  const { width: windowWidth } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_400Regular,
  });

  const initialEmail = typeof params.email === 'string' ? params.email : '';
  const [email, setEmail] = useState(initialEmail || 'awa.thiepp@gmail.com');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleSize = windowWidth < 360 ? 24 : windowWidth < 400 ? 26 : 28;

  const fonts = useMemo(
    () => ({
      bold: fontsLoaded ? 'Nunito_700Bold' : undefined,
      semi: fontsLoaded ? 'Nunito_600SemiBold' : undefined,
      regular: fontsLoaded ? 'Nunito_400Regular' : undefined,
    }),
    [fontsLoaded],
  );

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onContinue = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Veuillez saisir votre adresse e-mail.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await passwordResetGateway.requestOtp(trimmed);
      router.push({ pathname: Routes.FORGOT_PASSWORD_OTP, params: { email: trimmed } });
    } catch {
      setError('Impossible d’envoyer le code. Réessayez.');
    } finally {
      setBusy(false);
    }
  }, [email, router]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: 16 + insets.top,
              paddingHorizontal: 24,
              paddingBottom: FOOTER_RESERVE + insets.bottom,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.column, onboardingColumn, { gap: GAP_BLOCK }]}>
            <Pressable onPress={onBack} style={styles.backButton} hitSlop={8} accessibilityRole="button">
              <Feather name="arrow-left" size={22} color={ForgotPasswordFlowTheme.textPrimary} />
            </Pressable>

            <View style={styles.textBlock}>
              <Text
                style={[
                  styles.title,
                  { fontSize: titleSize, lineHeight: titleSize * 1.3 },
                  fonts.bold ? { fontFamily: fonts.bold } : { fontWeight: '700' },
                ]}
              >
                Mot de passe oublié 🔑
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  fonts.regular ? { fontFamily: fonts.regular } : { fontWeight: '400' },
                ]}
              >
                Entrez votre adresse e-mail pour obtenir un code OTP pour réinitialiser votre mot de
                passe.
              </Text>
            </View>

            <UnderlineLabeledField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              labelFontFamily={fonts.semi}
              inputFontFamily={fonts.bold}
            />

            {error ? (
              <Text style={[styles.error, fonts.regular ? { fontFamily: fonts.regular } : undefined]}>
                {error}
              </Text>
            ) : null}

            {busy ? (
              <View style={styles.loader}>
                <ActivityIndicator color={ForgotPasswordFlowTheme.accentBorder} />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <OnboardingContinueBar
        label="Continuer"
        onPress={busy ? undefined : onContinue}
        fontFamily={fonts.bold}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ForgotPasswordFlowTheme.background,
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  column: {
    width: '100%',
    maxWidth: Spacing.onboardingMaxWidth,
    alignItems: 'flex-start',
    gap: 20,
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  textBlock: {
    width: '100%',
    gap: 12,
  },
  title: {
    color: ForgotPasswordFlowTheme.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: ForgotPasswordFlowTheme.textMuted,
  },
  error: {
    fontSize: 14,
    color: '#C62828',
  },
  loader: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
});
