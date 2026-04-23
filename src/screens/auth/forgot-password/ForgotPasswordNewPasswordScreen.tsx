import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { PasswordResetSuccessModal } from '@components/ui/auth/forgot-password/PasswordResetSuccessModal';
import { OnboardingContinueBar } from '@components/ui/onboarding/OnboardingContinueBar';
import { ForgotPasswordFlowTheme } from '@constants/forgotPasswordFlowTheme';
import { onboardingColumn } from '@constants/layout';
import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { passwordResetGateway } from '@services/passwordReset/passwordResetGatewayInstance';

const FOOTER_RESERVE = 132;
const FORM_GAP = 28;

export default function ForgotPasswordNewPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';
  const { width: windowWidth } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_400Regular,
  });

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [secureA, setSecureA] = useState(true);
  const [secureB, setSecureB] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);

  const titleSize = windowWidth < 360 ? 24 : windowWidth < 400 ? 26 : 28;

  const fonts = useMemo(
    () => ({
      bold: fontsLoaded ? 'Nunito_700Bold' : undefined,
      semi: fontsLoaded ? 'Nunito_600SemiBold' : undefined,
      regular: fontsLoaded ? 'Nunito_400Regular' : undefined,
    }),
    [fontsLoaded],
  );

  useEffect(() => {
    if (!email) {
      router.replace(Routes.FORGOT_PASSWORD);
    }
  }, [email, router]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onContinue = useCallback(async () => {
    if (!password || password !== confirm) {
      setError('Les mots de passe ne correspondent pas ou sont trop courts.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await passwordResetGateway.completePendingReset(password);
      setSuccessVisible(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible d’enregistrer le mot de passe. Réessayez.');
    } finally {
      setBusy(false);
    }
  }, [password, confirm]);

  const onGoHome = useCallback(() => {
    setSuccessVisible(false);
    router.replace({ pathname: Routes.LOGIN, params: { email } });
  }, [email, router]);

  if (!email) {
    return null;
  }

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
          <View style={[styles.column, onboardingColumn, { gap: FORM_GAP }]}>
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
                Créer un nouveau mot de passe 🔐
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  fonts.regular ? { fontFamily: fonts.regular } : { fontWeight: '400' },
                ]}
              >
                Enregistrez le nouveau mot de passe dans un endroit sûr, si vous l&apos;oubliez, vous
                devez à nouveau faire un mot de passe oublié.
              </Text>
            </View>

            <View style={[styles.formBlock, { gap: 24 }]}>
              <UnderlineLabeledField
                label="Créer un nouveau mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureA}
                autoCapitalize="none"
                labelFontFamily={fonts.semi}
                inputFontFamily={fonts.bold}
                rightSlot={
                  <Pressable
                    onPress={() => setSecureA((v) => !v)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={secureA ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
                  >
                    <Feather name={secureA ? 'eye-off' : 'eye'} size={20} color="#FFD700" />
                  </Pressable>
                }
              />

              <UnderlineLabeledField
                label="Confirmer un nouveau mot de passe"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={secureB}
                autoCapitalize="none"
                labelFontFamily={fonts.semi}
                inputFontFamily={fonts.bold}
                rightSlot={
                  <Pressable
                    onPress={() => setSecureB((v) => !v)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={secureB ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
                  >
                    <Feather name={secureB ? 'eye-off' : 'eye'} size={20} color="#FFD700" />
                  </Pressable>
                }
              />
            </View>

            <Pressable style={styles.rememberRow} onPress={() => setRememberMe((v) => !v)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe ? <Feather name="check" size={16} color="#FFFFFF" /> : null}
              </View>
              <Text
                style={[
                  styles.rememberLabel,
                  fonts.semi ? { fontFamily: fonts.semi } : { fontWeight: '600' },
                ]}
              >
                Souviens-toi de moi
              </Text>
            </Pressable>

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

      <PasswordResetSuccessModal
        visible={successVisible}
        onGoHome={onGoHome}
        fonts={{ bold: fonts.bold, regular: fonts.regular }}
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
  formBlock: {
    width: '100%',
    alignItems: 'flex-start',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  rememberLabel: {
    fontSize: 16,
    lineHeight: 24,
    color: ForgotPasswordFlowTheme.textPrimary,
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
