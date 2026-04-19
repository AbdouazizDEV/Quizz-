import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { onboardingColumn } from '@constants/layout';
import { Spacing } from '@constants/Spacing';
import { getCountryByCca2 } from 'rn-international-phone-number';
import type { ICountry } from 'rn-country-select';

import { OnboardingContinueBar } from '@components/ui/onboarding/OnboardingContinueBar';
import { OnboardingCountryPickerField } from '@components/ui/onboarding/OnboardingCountryPickerField';
import { OnboardingDateField } from '@components/ui/onboarding/OnboardingDateField';
import { OnboardingFilledField } from '@components/ui/onboarding/OnboardingFilledField';
import { OnboardingInternationalPhoneField } from '@components/ui/onboarding/OnboardingInternationalPhoneField';
import { OnboardingProgressBar } from '@components/ui/onboarding/OnboardingProgressBar';
import { Routes } from '@constants/Routes';
import { useOnboardingRegisterStore } from '@stores/onboardingRegisterStore';

function computeAge(birth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(0, age);
}

const BOTTOM_BAR_MIN = 118;

export default function CreateAccountProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const titleFontSize = windowWidth < 360 ? 26 : 32;
  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
  });

  const [fullName, setFullName] = useState('Andrew Ainsley');
  const [birthDate, setBirthDate] = useState(() => new Date(1995, 11, 12));

  const initialCountry = useMemo(() => {
    const c = getCountryByCca2('US') ?? getCountryByCca2('FR');
    if (!c) {
      throw new Error('Country data unavailable');
    }
    return c;
  }, []);

  const [selectedCountry, setSelectedCountry] = useState<ICountry>(initialCountry);
  const [phoneValue, setPhoneValue] = useState('');
  const setProfile = useOnboardingRegisterStore((s) => s.setProfile);

  const ageLabel = useMemo(() => String(computeAge(birthDate)), [birthDate]);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    const y = birthDate.getFullYear();
    const m = String(birthDate.getMonth() + 1).padStart(2, '0');
    const d = String(birthDate.getDate()).padStart(2, '0');
    const birthDateIso = `${y}-${m}-${d}`;
    const phoneE164 = phoneValue.replace(/\s/g, '');
    if (!fullName.trim() || !phoneE164) {
      Alert.alert('Profil incomplet', 'Indiquez au minimum votre nom et votre numéro de téléphone.');
      return;
    }
    setProfile({
      fullName: fullName.trim(),
      birthDateIso,
      countryCca2: selectedCountry.cca2,
      phoneE164,
    });
    router.push(Routes.REGISTER);
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
            <OnboardingProgressBar progress={1} />
            <View style={styles.navRightSpacer} />
          </View>

          <View style={styles.body}>
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
                Veuillez compléter votre profil. Ne vous inquiétez pas, vos données resteront
                privées et vous seul pourrez les voir.
              </Text>
            </View>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.form}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <OnboardingFilledField
                label="Nom complet"
                value={fullName}
                onChangeText={setFullName}
                labelFontFamily={fontsLoaded ? 'Nunito_600SemiBold' : undefined}
                valueFontFamily={fontsLoaded ? 'Nunito_700Bold' : undefined}
              />

              <OnboardingDateField
                label="Date de naissance"
                value={birthDate}
                onChange={setBirthDate}
                labelFontFamily={fontsLoaded ? 'Nunito_600SemiBold' : undefined}
                valueFontFamily={fontsLoaded ? 'Nunito_700Bold' : undefined}
              />

              <OnboardingInternationalPhoneField
                label="Numéro de téléphone"
                country={selectedCountry}
                onChangeCountry={setSelectedCountry}
                onChangePhoneNumber={(value) => {
                  setPhoneValue(value);
                }}
                defaultCountry={selectedCountry.cca2}
                defaultPhoneNumber="5551234567"
                labelFontFamily={fontsLoaded ? 'Nunito_600SemiBold' : undefined}
              />

              <OnboardingCountryPickerField
                label="Pays"
                country={selectedCountry}
                onChangeCountry={setSelectedCountry}
                labelFontFamily={fontsLoaded ? 'Nunito_600SemiBold' : undefined}
                valueFontFamily={fontsLoaded ? 'Nunito_700Bold' : undefined}
              />

              <OnboardingFilledField
                label="Âge"
                value={ageLabel}
                editable={false}
                labelFontFamily={fontsLoaded ? 'Nunito_600SemiBold' : undefined}
                valueFontFamily={fontsLoaded ? 'Nunito_700Bold' : undefined}
              />
            </ScrollView>
          </View>
        </View>
      </View>

      <OnboardingContinueBar
        onPress={handleContinue}
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
    paddingBottom: 48,
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
  },
  navbar: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
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
    flexDirection: 'column',
    alignItems: 'center',
    gap: 28,
  },
  textBlock: {
    width: '100%',
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
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: 0.2,
    color: '#212121',
  },
  formScroll: {
    width: '100%',
    flexGrow: 1,
    maxHeight: 491,
  },
  form: {
    width: '100%',
    flexGrow: 1,
    minHeight: 200,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 24,
    paddingBottom: 8,
  },
});
