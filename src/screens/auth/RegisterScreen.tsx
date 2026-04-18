import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingContinueBar } from '@components/ui/onboarding/OnboardingContinueBar';
import { OnboardingProgressBar } from '@components/ui/onboarding/OnboardingProgressBar';
import { onboardingColumn } from '@constants/layout';
import { Routes } from '@constants/Routes';
import { persistLoginAndSyncStore } from '@services/auth/authSessionController';
import { Spacing } from '@constants/Spacing';

const BOTTOM_BAR_MIN = 118;
const SUCCESS_MODAL_MS = 5_000;
const PLACEHOLDER_COLOR = '#8E8E93';

interface SocialActionButtonProps {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  iconColor: string;
  fontFamily?: string;
  onPress?: () => void;
}

function SocialActionButton({
  label,
  icon,
  iconColor,
  fontFamily,
  onPress,
}: SocialActionButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.socialButton, pressed && styles.pressed]}>
      <Feather name={icon} size={20} color={iconColor} />
      <Text style={[styles.socialButtonText, fontFamily ? { fontFamily } : undefined]}>{label}</Text>
    </Pressable>
  );
}

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const titleFontSize = windowWidth < 360 ? 26 : 32;

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_400Regular,
  });

  const [username, setUsername] = useState('Awa thiépp');
  const [email, setEmail] = useState('awa.thiepp@gmail.com');
  const [password, setPassword] = useState('mypassword123');
  const [rememberMe, setRememberMe] = useState(true);
  const [secure, setSecure] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;
  const avatarPulse = useRef(new Animated.Value(1)).current;
  const sparkRotate = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sparkAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const pulseAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleSignup = () => {
    setShowSuccess(true);
  };

  useEffect(() => {
    if (!showSuccess) {
      return;
    }

    overlayOpacity.setValue(0);
    cardScale.setValue(0.88);
    cardTranslateY.setValue(30);
    avatarPulse.setValue(1);
    sparkRotate.setValue(0);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 110,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.4)),
      }),
    ]).start();

    sparkAnimRef.current = Animated.loop(
      Animated.timing(sparkRotate, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    sparkAnimRef.current.start();

    pulseAnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarPulse, {
          toValue: 1.06,
          duration: 620,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(avatarPulse, {
          toValue: 1,
          duration: 620,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimRef.current.start();

    timeoutRef.current = setTimeout(() => {
      void (async () => {
        setShowSuccess(false);
        try {
          await persistLoginAndSyncStore('demo-session');
        } catch {
          /* persistance optionnelle : navigation inchangée pour la démo */
        }
        router.replace(Routes.HOME);
      })();
    }, SUCCESS_MODAL_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      sparkAnimRef.current?.stop();
      pulseAnimRef.current?.stop();
    };
  }, [
    avatarPulse,
    cardScale,
    cardTranslateY,
    overlayOpacity,
    router,
    showSuccess,
    sparkRotate,
  ]);

  const rotate = sparkRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View
        style={[
          styles.globalContainer,
          {
            paddingTop: Spacing.lg + insets.top,
            paddingHorizontal: Spacing.screenHorizontal,
            bottom: BOTTOM_BAR_MIN + insets.bottom,
          },
        ]}
      >
        <View style={[styles.mainContent, onboardingColumn]}>
          <View style={styles.navbar}>
            <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
              <Feather name="arrow-left" size={22} color="#212121" />
            </Pressable>
            <OnboardingProgressBar progress={1} />
            <View style={styles.navSpacer} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.textBlock}>
              <Text
                style={[
                  styles.title,
                  { fontSize: titleFontSize, lineHeight: titleFontSize * 1.35 },
                  fontsLoaded ? { fontFamily: 'Nunito_700Bold' } : { fontWeight: '700' },
                ]}
              >
                Créer un compte ✏️
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  fontsLoaded ? { fontFamily: 'Nunito_400Regular' } : { fontWeight: '400' },
                ]}
              >
                Veuillez saisir votre nom d&apos;utilisateur, votre adresse e-mail et votre mot de
                passe.
              </Text>
            </View>

            <View style={styles.formBlock}>
              <View style={styles.fieldBlock}>
                <Text
                  style={[
                    styles.fieldLabel,
                    fontsLoaded ? { fontFamily: 'Nunito_600SemiBold' } : { fontWeight: '600' },
                  ]}
                >
                  Nom d&apos;utilisateur
                </Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  style={[
                    styles.fieldInput,
                    fontsLoaded ? { fontFamily: 'Nunito_700Bold' } : { fontWeight: '700' },
                  ]}
                  placeholder="Votre nom d'utilisateur"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  autoCapitalize="none"
                />
                <View style={styles.underline} />
              </View>

              <View style={styles.fieldBlock}>
                <Text
                  style={[
                    styles.fieldLabel,
                    fontsLoaded ? { fontFamily: 'Nunito_600SemiBold' } : { fontWeight: '600' },
                  ]}
                >
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={[
                    styles.fieldInput,
                    fontsLoaded ? { fontFamily: 'Nunito_700Bold' } : { fontWeight: '700' },
                  ]}
                  placeholder="Votre email"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={styles.underline} />
              </View>

              <View style={styles.fieldBlock}>
                <Text
                  style={[
                    styles.fieldLabel,
                    fontsLoaded ? { fontFamily: 'Nunito_600SemiBold' } : { fontWeight: '600' },
                  ]}
                >
                  Mot de passe
                </Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    style={[
                      styles.fieldInput,
                      styles.passwordInput,
                      fontsLoaded ? { fontFamily: 'Nunito_700Bold' } : { fontWeight: '700' },
                    ]}
                    secureTextEntry={secure}
                    placeholder="Votre mot de passe"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => setSecure((prev) => !prev)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={secure ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
                  >
                    <Feather name={secure ? 'eye-off' : 'eye'} size={20} color="#FFD700" />
                  </Pressable>
                </View>
                <View style={styles.underline} />
              </View>
            </View>

            <Pressable style={styles.rememberRow} onPress={() => setRememberMe((prev) => !prev)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe ? <Feather name="check" size={16} color="#FFFFFF" /> : null}
              </View>
              <Text
                style={[
                  styles.rememberLabel,
                  fontsLoaded ? { fontFamily: 'Nunito_600SemiBold' } : { fontWeight: '600' },
                ]}
              >
                Souviens-toi de moi
              </Text>
            </Pressable>

            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text
                style={[
                  styles.orText,
                  fontsLoaded ? { fontFamily: 'Nunito_400Regular' } : { fontWeight: '400' },
                ]}
              >
                or
              </Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialContainer}>
              <SocialActionButton
                label="Continuer avec Google"
                icon="chrome"
                iconColor="#4285F4"
                fontFamily={fontsLoaded ? 'Nunito_600SemiBold' : undefined}
              />
              <SocialActionButton
                label="Continuer avec Facebook"
                icon="facebook"
                iconColor="#1877F2"
                fontFamily={fontsLoaded ? 'Nunito_600SemiBold' : undefined}
              />
            </View>
          </ScrollView>
        </View>
      </View>

      <OnboardingContinueBar
        label="Inscrivez-vous"
        onPress={handleSignup}
        fontFamily={fontsLoaded ? 'Nunito_700Bold' : undefined}
      />

      <Modal visible={showSuccess} transparent animationType="none">
        <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
          <Animated.View
            style={[
              styles.modalCard,
              {
                transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.sparkRing,
                {
                  transform: [{ rotate }],
                },
              ]}
            >
              <View style={[styles.sparkDot, styles.sparkTop]} />
              <View style={[styles.sparkDot, styles.sparkRight]} />
              <View style={[styles.sparkDot, styles.sparkBottom]} />
              <View style={[styles.sparkDot, styles.sparkLeft]} />
            </Animated.View>

            <Animated.View
              style={[
                styles.avatarCircle,
                {
                  transform: [{ scale: avatarPulse }],
                },
              ]}
            >
              <Feather name="user" size={38} color="#FFFFFF" />
            </Animated.View>

            <Text style={[styles.modalTitle, fontsLoaded ? { fontFamily: 'Nunito_700Bold' } : undefined]}>
              Réussi !
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                fontsLoaded ? { fontFamily: 'Nunito_400Regular' } : undefined,
              ]}
            >
              Attendez un instant, nous nous préparons pour vous...
            </Text>

            <ActivityIndicator size="large" color="#F5B200" style={styles.loader} />
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  globalContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    paddingBottom: 24,
  },
  mainContent: {
    width: '100%',
    flex: 1,
    minHeight: 0,
    gap: 24,
  },
  navbar: {
    width: '100%',
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
  },
  navSpacer: {
    width: 24,
  },
  scroll: {
    width: '100%',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
    gap: 24,
  },
  textBlock: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    width: '100%',
    textAlign: 'center',
    color: '#212121',
  },
  subtitle: {
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
    letterSpacing: 0.2,
  },
  formBlock: {
    width: '100%',
    gap: 24,
  },
  fieldBlock: {
    width: '100%',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: '#212121',
  },
  fieldInput: {
    width: '100%',
    fontSize: 16,
    lineHeight: 24,
    color: '#2A2A2A',
    padding: 0,
    margin: 0,
  },
  passwordRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordInput: {
    flex: 1,
  },
  underline: {
    width: '100%',
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 215, 0, 0.87)',
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
    fontSize: 20,
    lineHeight: 30,
    color: '#212121',
  },
  orDivider: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  orText: {
    fontSize: 20,
    lineHeight: 26,
    color: '#616161',
  },
  socialContainer: {
    width: '100%',
    gap: 16,
  },
  socialButton: {
    width: '100%',
    minHeight: 60,
    borderWidth: 1,
    borderBottomWidth: 4,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  socialButtonText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#212121',
  },
  pressed: {
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 34, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 34,
    paddingBottom: 30,
  },
  sparkRing: {
    position: 'absolute',
    width: 136,
    height: 136,
    top: 20,
  },
  sparkDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 100,
    backgroundColor: '#F9D667',
  },
  sparkTop: {
    top: 0,
    left: 62,
  },
  sparkRight: {
    right: 0,
    top: 62,
  },
  sparkBottom: {
    bottom: 0,
    left: 62,
  },
  sparkLeft: {
    left: 0,
    top: 62,
  },
  avatarCircle: {
    width: 116,
    height: 116,
    borderRadius: 100,
    backgroundColor: '#F5B200',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 26,
  },
  modalTitle: {
    fontSize: 36,
    lineHeight: 46,
    color: '#F5B200',
    marginBottom: 8,
  },
  modalSubtitle: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 34,
    color: '#424242',
    marginBottom: 24,
  },
  loader: {
    marginTop: 8,
  },
});
