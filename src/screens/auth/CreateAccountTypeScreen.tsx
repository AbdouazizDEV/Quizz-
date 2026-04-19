import { Nunito_400Regular, Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AccountTypeOption,
  AccountTypeOptionCard,
} from '@components/ui/onboarding/AccountTypeOptionCard';
import { OnboardingProgressBar } from '@components/ui/onboarding/OnboardingProgressBar';
import { OnboardingSkipBar } from '@components/ui/onboarding/OnboardingSkipBar';
import { onboardingColumn } from '@constants/layout';
import { Spacing } from '@constants/Spacing';
import { Routes } from '@constants/Routes';
import { useOnboardingRegisterStore } from '@stores/onboardingRegisterStore';

const OPTIONS: AccountTypeOption[] = [
  {
    id: 'personal',
    label: 'Personnel',
    gradientStart: '#FFB703',
    gradientEnd: '#FFB703',
    icon: 'user',
  },
  {
    id: 'teacher',
    label: 'Professeur',
    gradientStart: '#FB8500',
    gradientEnd: '#FB8500',
    icon: 'users',
  },
  {
    id: 'student',
    label: 'Étudiant',
    gradientStart: '#00B894',
    gradientEnd: '#00B894',
    icon: 'user-check',
  },
  {
    id: 'professional',
    label: 'Professionnel',
    gradientStart: '#FF6B6B',
    gradientEnd: '#FF6B6B',
    icon: 'briefcase',
  },
];

const BOTTOM_BAR_MIN = 132;

export default function CreateAccountTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const titleFontSize = windowWidth < 360 ? 24 : windowWidth < 400 ? 28 : 32;
  const titleLineHeight = Math.round(titleFontSize * 1.45);

  const [fontsLoaded] = useFonts({ Nunito_700Bold, Nunito_400Regular });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const setAccountTypeId = useOnboardingRegisterStore((s) => s.setAccountTypeId);

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    router.replace(Routes.WALKTHROUGH);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setAccountTypeId(id);
    router.push(Routes.CREATE_ACCOUNT_WORKPLACE);
  };

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
            <OnboardingProgressBar progress={1 / 3} />
            <View style={styles.navRightSpacer} />
          </View>

          <View style={styles.body}>
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
                    { fontSize: titleFontSize, lineHeight: titleLineHeight },
                    fontsLoaded ? { fontFamily: 'Nunito_700Bold' } : { fontWeight: '700' },
                  ]}
                >
                  Quel type de compte{'\n'}aimez-vous créer ? 👦
                </Text>
                <Text
                  style={[
                    styles.description,
                    fontsLoaded ? { fontFamily: 'Nunito_400Regular' } : { fontWeight: '400' },
                  ]}
                >
                  Vous pouvez l&apos;ignorer si vous n&apos;êtes pas sûr.
                </Text>
              </View>

              <View style={styles.optionsBlock}>
                {OPTIONS.map((option) => (
                  <AccountTypeOptionCard
                    key={option.id}
                    option={option}
                    selected={selectedId === option.id}
                    onPress={handleSelect}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      <OnboardingSkipBar
        onSkip={handleSkip}
        fontFamily={fontsLoaded ? 'Nunito_700Bold' : undefined}
      />
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
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.xl,
    minHeight: 0,
    width: '100%',
  },
  navbar: {
    width: '100%',
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: Spacing.lg,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  navRightSpacer: {
    width: 24,
  },
  body: {
    width: '100%',
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
    alignItems: 'center',
  },
  scroll: {
    width: '100%',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.lg,
    gap: Spacing.xxl,
    alignItems: 'stretch',
  },
  textBlock: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    width: '100%',
    textAlign: 'center',
    color: '#212121',
  },
  description: {
    width: '100%',
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
    letterSpacing: 0.2,
    color: '#212121',
  },
  optionsBlock: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: Spacing.xl,
  },
});
