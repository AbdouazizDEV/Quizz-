import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
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
import { AuthMethodSwitch, type AuthMethod } from '@components/ui/auth/AuthMethodSwitch';
import { AuthSocialDivider } from '@components/ui/auth/AuthSocialDivider';
import { SocialAuthButtons } from '@components/ui/auth/SocialAuthButtons';
import { WalkthroughActionButton } from '@components/ui/walkthrough/WalkthroughActionButton';
import { AUTH_FORM_PLACEHOLDERS } from '@constants/authFormPlaceholders';
import { onboardingColumn } from '@constants/layout';
import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { isGoogleSignInConfigured } from '@config';
import { useGoogleAuthFinish } from '@hooks/useGoogleAuthFinish';
import type { AuthSessionPayload, AuthUser } from '@app-types/authSession.types';
import {
  persistPasskeyAuthResult,
  signOutAndSyncStore,
} from '@services/auth/authSessionController';
import { canUseLocalPasskey } from '@services/auth/devicePasskeyCapability';
import { mapLoginUserToAuthMe } from '@services/auth/mapLoginToAuthMe';
import { getAuthMeFromStore } from '@services/auth/authMeRepository';
import { loginGateway } from '@services/auth/loginGatewayInstance';
import { toFrenchPasskeyError } from '@services/auth/passkeyAuthService';
import { loginWithPassword } from '@services/auth/passwordAuthService';
import { resolvePostLoginHref } from '@utils/postLoginRedirect';

const FOOTER_BAR_HEIGHT = 118;
const CONTENT_GAP = 28;
const FORM_GAP = 32;

export default function LoginScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const postLoginHref = resolvePostLoginHref(returnTo);
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_400Regular,
  });

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const [capabilityReady, setCapabilityReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [discoverableSubmitting, setDiscoverableSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const showGoogle = isGoogleSignInConfigured();
  const {
    signInWithGoogle,
    googleSubmitting,
    googleError,
    showRegisterPrompt,
    clearGoogleError,
  } = useGoogleAuthFinish();

  const displayError = formError ?? googleError;
  const titleSize = windowWidth < 360 ? 28 : windowWidth < 400 ? 32 : 36;

  const fonts = {
    bold: fontsLoaded ? 'Nunito_700Bold' : undefined,
    semi: fontsLoaded ? 'Nunito_600SemiBold' : undefined,
    regular: fontsLoaded ? 'Nunito_400Regular' : undefined,
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const ok = await canUseLocalPasskey();
      if (!cancelled) {
        setPasskeyAvailable(ok);
        setAuthMethod(ok ? 'passkey' : 'password');
        setCapabilityReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const usePasswordMode = authMethod === 'password';

  const onRegister = useCallback(() => {
    router.replace(Routes.CREATE_ACCOUNT_TYPE);
  }, [router]);

  const finishLogin = useCallback(
    async (result: { user?: AuthUser | null; session: AuthSessionPayload }) => {
      if (!result.session) throw new Error('Session absente.');
      await persistPasskeyAuthResult(
        result.session,
        result.user ? mapLoginUserToAuthMe(result.user) : null,
      );
      if (!getAuthMeFromStore()) {
        await signOutAndSyncStore();
        throw new Error('Profil introuvable après connexion.');
      }
      router.replace(postLoginHref);
    },
    [postLoginHref, router],
  );

  const onSubmit = useCallback(async () => {
    if (submitting || discoverableSubmitting || googleSubmitting) return;
    const trimmed = identifier.trim();
    if (!trimmed) {
      setFormError('Saisissez votre e-mail ou nom d’utilisateur.');
      return;
    }
    if (usePasswordMode && !password) {
      setFormError('Saisissez votre mot de passe.');
      return;
    }
    setFormError(null);
    clearGoogleError();
    setSubmitting(true);
    try {
      if (usePasswordMode) {
        const looksLikeEmail = trimmed.includes('@');
        const result = await loginWithPassword(
          looksLikeEmail
            ? { email: trimmed, password }
            : { username: trimmed, password },
        );
        await finishLogin(result);
      } else {
        const result = await loginGateway.signIn({ identifier: trimmed });
        await finishLogin(result);
      }
    } catch (error) {
      const message = toFrenchPasskeyError(error);
      setFormError(message);
      if (!usePasswordMode && /e-mail et mot de passe/i.test(message)) {
        setAuthMethod('password');
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    discoverableSubmitting,
    finishLogin,
    googleSubmitting,
    clearGoogleError,
    identifier,
    password,
    submitting,
    usePasswordMode,
  ]);

  const onDiscoverableLogin = useCallback(async () => {
    if (submitting || discoverableSubmitting || googleSubmitting || usePasswordMode) return;
    setFormError(null);
    setDiscoverableSubmitting(true);
    try {
      const result = await loginGateway.signInDiscoverable();
      await finishLogin(result);
    } catch (error) {
      setFormError(toFrenchPasskeyError(error));
    } finally {
      setDiscoverableSubmitting(false);
    }
  }, [discoverableSubmitting, finishLogin, googleSubmitting, submitting, usePasswordMode]);

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
              paddingBottom: FOOTER_BAR_HEIGHT + insets.bottom + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.column, onboardingColumn, { gap: CONTENT_GAP }]}>
            <View style={[styles.headerBlock, { gap: 24 }]}>
              <WalkthroughActionButton
                label="INSCRIPTION"
                variant="primary"
                size="compact"
                onPress={onRegister}
                fontFamily={fonts.bold}
                accessibilityLabel="Inscription"
                leadingIcon={<Feather name="user-plus" size={16} color="#212121" />}
              />
              <Text
                style={[
                  styles.greeting,
                  { fontSize: titleSize, lineHeight: titleSize * 1.25 },
                  fonts.bold ? { fontFamily: fonts.bold } : { fontWeight: '700' },
                ]}
              >
                Bonjour 👋
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  fonts.regular ? { fontFamily: fonts.regular } : { fontWeight: '400' },
                ]}
              >
                {showGoogle && usePasswordMode
                  ? 'Google, e-mail / pseudo et mot de passe.'
                  : usePasswordMode
                    ? 'Connectez-vous avec votre e-mail (ou pseudo) et votre mot de passe.'
                    : capabilityReady
                      ? 'Connectez-vous avec Face ID ou empreinte digitale.'
                      : 'Vérification de la sécurité de l’appareil…'}
              </Text>
              {capabilityReady && passkeyAvailable ? (
                <AuthMethodSwitch
                  value={authMethod}
                  onChange={setAuthMethod}
                  passkeyAvailable={passkeyAvailable}
                  labelFontFamily={fonts.semi}
                />
              ) : null}
            </View>

            <View style={[styles.formBlock, { gap: FORM_GAP }]}>
              {displayError ? (
                <View style={styles.errorBlock}>
                  <Text style={[styles.formError, fonts.regular ? { fontFamily: fonts.regular } : undefined]}>
                    {displayError}
                  </Text>
                  {showRegisterPrompt ? (
                    <Pressable accessibilityRole="button" onPress={onRegister}>
                      <Text style={[styles.registerLink, fonts.semi ? { fontFamily: fonts.semi } : undefined]}>
                        Créer un compte
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              {showGoogle && usePasswordMode ? (
                <>
                  <SocialAuthButtons
                    fontFamily={fonts.semi}
                    loading={googleSubmitting}
                    onGooglePress={() => void signInWithGoogle()}
                    onFacebookPress={() => undefined}
                    showFacebook={false}
                  />
                  <AuthSocialDivider fontFamily={fonts.regular} />
                </>
              ) : null}

              <UnderlineLabeledField
                label="E-mail ou pseudo"
                value={identifier}
                onChangeText={setIdentifier}
                placeholder={AUTH_FORM_PLACEHOLDERS.email}
                autoCapitalize="none"
                labelFontFamily={fonts.semi}
                inputFontFamily={fonts.bold}
              />

              {usePasswordMode ? (
                <>
                  <UnderlineLabeledField
                    label="Mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    autoCapitalize="none"
                    labelFontFamily={fonts.semi}
                    inputFontFamily={fonts.bold}
                  />
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push(Routes.FORGOT_PASSWORD)}
                    style={styles.forgotLink}
                  >
                    <Text style={[styles.forgotText, fonts.semi ? { fontFamily: fonts.semi } : undefined]}>
                      Mot de passe oublié ?
                    </Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void onDiscoverableLogin()}
                  disabled={submitting || discoverableSubmitting}
                  style={styles.discoverableLink}
                >
                  <Text style={[styles.discoverableText, fonts.semi ? { fontFamily: fonts.semi } : undefined]}>
                    Utiliser un passkey enregistré sur cet appareil
                  </Text>
                </Pressable>
              )}

              {usePasswordMode ? (
                <Text
                  style={[
                    styles.sessionHint,
                    fonts.regular ? { fontFamily: fonts.regular } : { fontWeight: '400' },
                  ]}
                >
                  Session limitée à 24 h. Choisissez Passkey pour une connexion biométrique durable.
                </Text>
              ) : null}
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
          {submitting || discoverableSubmitting || googleSubmitting ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator color="#543ACC" />
            </View>
          ) : null}
          <WalkthroughActionButton
            label={usePasswordMode ? 'SE CONNECTER' : 'SE CONNECTER AVEC PASSKEY'}
            variant="primary"
            onPress={
              submitting || discoverableSubmitting || googleSubmitting ? undefined : onSubmit
            }
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
  greeting: {
    color: '#212121',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#616161',
  },
  formBlock: {
    width: '100%',
    alignItems: 'flex-start',
  },
  formError: {
    width: '100%',
    fontSize: 14,
    lineHeight: 20,
    color: '#C62828',
  },
  errorBlock: {
    width: '100%',
    gap: 8,
  },
  registerLink: {
    fontSize: 15,
    color: '#543ACC',
    textDecorationLine: 'underline',
  },
  forgotLink: {
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 15,
    color: '#543ACC',
    textDecorationLine: 'underline',
  },
  discoverableLink: {
    paddingVertical: 4,
  },
  discoverableText: {
    fontSize: 15,
    color: '#543ACC',
    textDecorationLine: 'underline',
  },
  sessionHint: {
    fontSize: 13,
    lineHeight: 18,
    color: '#757575',
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
