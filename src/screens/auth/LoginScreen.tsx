import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { WalkthroughActionButton } from '@components/ui/walkthrough/WalkthroughActionButton';
import { onboardingColumn } from '@constants/layout';
import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { persistLoginAndSyncStore } from '@services/auth/authSessionController';
import { loginGateway } from '@services/auth/loginGatewayInstance';

const FOOTER_BAR_HEIGHT = 118;
const CONTENT_GAP = 28;
const FORM_GAP = 32;

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_400Regular,
  });

  const [email, setEmail] = useState('awa.thiepp@gmail.com');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [secure, setSecure] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const titleSize = windowWidth < 360 ? 28 : windowWidth < 400 ? 32 : 36;

  const fonts = useMemo(
    () => ({
      bold: fontsLoaded ? 'Nunito_700Bold' : undefined,
      semi: fontsLoaded ? 'Nunito_600SemiBold' : undefined,
      regular: fontsLoaded ? 'Nunito_400Regular' : undefined,
    }),
    [fontsLoaded],
  );

  const onBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(Routes.WALKTHROUGH);
  }, [router]);

  const onForgotPassword = useCallback(() => {
    const trimmed = email.trim();
    if (trimmed) {
      router.push({ pathname: Routes.FORGOT_PASSWORD, params: { email: trimmed } });
      return;
    }
    router.push(Routes.FORGOT_PASSWORD);
  }, [email, router]);

  const onSubmit = useCallback(async () => {
    if (submitting) return;
    const trimmed = email.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const { accessToken } = await loginGateway.signIn({ email: trimmed, password });
      await persistLoginAndSyncStore(accessToken);
      router.replace(Routes.HOME);
    } finally {
      setSubmitting(false);
    }
  }, [email, password, router, submitting]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: 16 + insets.top,
              paddingHorizontal: 24,
              paddingBottom: FOOTER_BAR_HEIGHT + insets.bottom + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.column, onboardingColumn, { gap: CONTENT_GAP }]}>
            <View style={[styles.headerBlock, { gap: 24 }]}>
              <Pressable onPress={onBack} style={styles.backButton} hitSlop={8} accessibilityRole="button">
                <Feather name="arrow-left" size={22} color="#212121" />
              </Pressable>
              <Text
                style={[
                  styles.greeting,
                  { fontSize: titleSize, lineHeight: titleSize * 1.25 },
                  fonts.bold ? { fontFamily: fonts.bold } : { fontWeight: '700' },
                ]}
              >
                Bonjour 👋
              </Text>
            </View>

            <View style={[styles.formBlock, { gap: FORM_GAP }]}>
              <UnderlineLabeledField
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                labelFontFamily={fonts.semi}
                inputFontFamily={fonts.bold}
              />

              <UnderlineLabeledField
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
                autoCapitalize="none"
                labelFontFamily={fonts.semi}
                inputFontFamily={fonts.bold}
                rightSlot={
                  <Pressable
                    onPress={() => setSecure((v) => !v)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={secure ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
                  >
                    <Feather name={secure ? 'eye-off' : 'eye'} size={20} color="#FFD700" />
                  </Pressable>
                }
              />

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

              <View style={styles.forgotWrap}>
                <View style={styles.forgotDivider} />
                <Pressable accessibilityRole="button" onPress={onForgotPassword}>
                  <Text
                    style={[
                      styles.forgotLink,
                      fonts.regular ? { fontFamily: fonts.regular } : { fontWeight: '400' },
                    ]}
                  >
                    Mot de passe oublié ?
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.footerBar,
          {
            paddingBottom: Math.max(36, 16 + insets.bottom),
            paddingTop: 24,
            paddingHorizontal: 24,
          },
        ]}
      >
        <View style={[styles.footerInner, onboardingColumn]}>
          {submitting ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator color="#543ACC" />
            </View>
          ) : null}
          <WalkthroughActionButton
            label="SE CONNECTER"
            variant="primary"
            onPress={onSubmit}
            fontFamily={fonts.bold}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  column: {
    width: '100%',
    maxWidth: Spacing.onboardingMaxWidth,
    alignItems: 'flex-start',
  },
  headerBlock: {
    width: '100%',
    alignItems: 'flex-start',
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  greeting: {
    color: '#212121',
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
    color: '#212121',
  },
  forgotWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  forgotDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  forgotLink: {
    fontSize: 15,
    color: '#FFD700',
    textAlign: 'center',
  },
  footerBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    alignItems: 'center',
  },
  footerInner: {
    width: '100%',
    gap: 12,
  },
  loaderRow: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
});
