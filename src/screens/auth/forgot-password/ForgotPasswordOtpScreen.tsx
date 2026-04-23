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
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ForgotPasswordNumericKeypad } from '@components/ui/auth/forgot-password/ForgotPasswordNumericKeypad';
import { OtpDigitsRow } from '@components/ui/auth/forgot-password/OtpDigitsRow';
import { WalkthroughActionButton } from '@components/ui/walkthrough/WalkthroughActionButton';
import { ForgotPasswordFlowTheme } from '@constants/forgotPasswordFlowTheme';
import { onboardingColumn } from '@constants/layout';
import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { passwordResetGateway } from '@services/passwordReset/passwordResetGatewayInstance';

const OTP_LEN = 4;
const RESEND_SECONDS = 55;

export default function ForgotPasswordOtpScreen() {
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

  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
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

  useEffect(() => {
    if (!email) {
      router.replace(Routes.FORGOT_PASSWORD);
    }
  }, [email, router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const highlightIndex = useMemo(() => {
    if (code.length >= OTP_LEN) return OTP_LEN - 1;
    return code.length;
  }, [code.length]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const appendDigit = useCallback((d: string) => {
    setError(null);
    setCode((prev) => {
      if (prev.length >= OTP_LEN) return prev;
      return prev + d;
    });
  }, []);

  const onBackspace = useCallback(() => {
    setError(null);
    setCode((prev) => prev.slice(0, -1));
  }, []);

  const onConfirm = useCallback(async () => {
    if (code.length !== OTP_LEN || !email) return;
    setBusy(true);
    setError(null);
    try {
      await passwordResetGateway.verifyOtp(email, code);
      router.push({ pathname: Routes.FORGOT_PASSWORD_NEW, params: { email } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Code incorrect ou expiré.');
    } finally {
      setBusy(false);
    }
  }, [code, email, router]);

  const onResend = useCallback(async () => {
    if (secondsLeft > 0 || !email || busy) return;
    setBusy(true);
    setError(null);
    try {
      await passwordResetGateway.requestOtp(email);
      setSecondsLeft(RESEND_SECONDS);
      setCode('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec du renvoi du code.');
    } finally {
      setBusy(false);
    }
  }, [secondsLeft, email, busy]);

  if (!email) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 16 + insets.top,
            paddingHorizontal: 24,
            paddingBottom: 16,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.column, onboardingColumn, { gap: 20 }]}>
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
              Vous avez du courrier ✉️
            </Text>
            <Text
              style={[
                styles.subtitle,
                fonts.regular ? { fontFamily: fonts.regular } : { fontWeight: '400' },
              ]}
            >
              Nous avons envoyé le code de vérification OTP à votre adresse e-mail. Vérifiez votre
              email et entrez le code ci-dessous.
            </Text>
          </View>

          <OtpDigitsRow value={code} activeIndex={highlightIndex} fontFamily={fonts.bold} />

          {secondsLeft > 0 ? (
            <Text
              style={[
                styles.resendText,
                styles.resendCentered,
                fonts.regular ? { fontFamily: fonts.regular } : { fontWeight: '400' },
              ]}
            >
              Vous n&apos;avez pas reçu d&apos;e-mail ? Vous pouvez renvoyer le code dans{' '}
              <Text style={styles.resendStrong}>{secondsLeft} s</Text>
            </Text>
          ) : (
            <View style={styles.resendRow}>
              <Text
                style={[
                  styles.resendText,
                  fonts.regular ? { fontFamily: fonts.regular } : { fontWeight: '400' },
                ]}
              >
                Vous n&apos;avez pas reçu d&apos;e-mail ?{' '}
              </Text>
              <Pressable onPress={onResend} hitSlop={6}>
                <Text style={styles.resendLink}>Renvoyer le code</Text>
              </Pressable>
            </View>
          )}

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

          <WalkthroughActionButton
            label="Confirmer"
            variant="primary"
            onPress={busy ? undefined : onConfirm}
            fontFamily={fonts.bold}
          />
        </View>
      </ScrollView>

      <ForgotPasswordNumericKeypad
        onDigit={appendDigit}
        onBackspace={onBackspace}
        disabled={busy}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ForgotPasswordFlowTheme.background,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 8,
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
  resendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  resendText: {
    fontSize: 14,
    lineHeight: 20,
    color: ForgotPasswordFlowTheme.textMuted,
  },
  resendCentered: {
    textAlign: 'center',
    width: '100%',
  },
  resendStrong: {
    fontWeight: '700',
    color: ForgotPasswordFlowTheme.textPrimary,
  },
  resendLink: {
    fontWeight: '700',
    color: ForgotPasswordFlowTheme.accent,
    textDecorationLine: 'underline',
  },
  error: {
    fontSize: 14,
    color: '#C62828',
    width: '100%',
    textAlign: 'center',
  },
  loader: {
    alignSelf: 'center',
  },
});
