import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PersonalInfoHeroCard } from '@components/ui/settings/PersonalInfoHeroCard';
import { SettingsFormField } from '@components/ui/settings/SettingsFormField';
import { SettingsLeadingHeader } from '@components/ui/settings/SettingsLeadingHeader';
import { SettingsSectionCard } from '@components/ui/settings/SettingsSectionCard';
import { Routes } from '@constants/Routes';
import { SettingsScreenTheme } from '@constants/settingsScreenTheme';
import { useAuthMe } from '@hooks/useAuthMe';
import { usePersonalInfo } from '@hooks/usePersonalInfo';
import { getNetworkHorizontalPadding } from '@utils/networkResponsiveLayout';

const ACCOUNT_TYPES = [
  { value: 'personal', label: 'Personnel' },
  { value: 'student', label: 'Étudiant' },
  { value: 'professional', label: 'Professionnel' },
];

const WORKPLACES = [
  { value: 'higher-education', label: 'Enseignement supérieur' },
  { value: 'school', label: 'École / collège / lycée' },
  { value: 'company', label: 'Entreprise' },
  { value: 'other', label: 'Autre' },
];

export default function PersonalInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontalPad = useMemo(() => getNetworkHorizontalPadding(width), [width]);
  const { data: authMe } = useAuthMe();
  const { form, loading, saving, error, saved, updateField, save } = usePersonalInfo();

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_500Medium,
  });

  const fonts = useMemo(
    () => ({
      bold: fontsLoaded ? 'Nunito_700Bold' : undefined,
      semiBold: fontsLoaded ? 'Nunito_600SemiBold' : undefined,
      medium: fontsLoaded ? 'Nunito_500Medium' : undefined,
    }),
    [fontsLoaded],
  );

  const onBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(Routes.SETTINGS);
  }, [router]);

  const userId = authMe?.user?.id ?? '';

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', '#FFF8E1']} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + SettingsScreenTheme.pagePaddingTop,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: horizontalPad,
          alignItems: 'center',
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <SettingsLeadingHeader title="Informations personnelles" onBack={onBack} fonts={fonts} />

          {loading || !form ? (
            <ActivityIndicator style={styles.loader} color="#FFB703" size="large" />
          ) : (
            <>
              <PersonalInfoHeroCard form={form} userId={userId} fonts={fonts} />

              <SettingsSectionCard title="Identité" fonts={fonts}>
                <SettingsFormField
                  label="E-mail"
                  value={form.email}
                  onChangeText={() => {}}
                  fonts={fonts}
                  editable={false}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <SettingsFormField
                  label="Nom complet"
                  value={form.fullName}
                  onChangeText={(v) => updateField('fullName', v)}
                  fonts={fonts}
                  placeholder="Votre nom"
                />
                <SettingsFormField
                  label="Nom d'utilisateur"
                  value={form.username}
                  onChangeText={(v) => updateField('username', v)}
                  fonts={fonts}
                  placeholder="Pseudo visible"
                  autoCapitalize="none"
                />
                <SettingsFormField
                  label="Bio"
                  value={form.bio}
                  onChangeText={(v) => updateField('bio', v)}
                  fonts={fonts}
                  placeholder="Quelques mots sur vous…"
                  multiline
                />
              </SettingsSectionCard>

              <SettingsSectionCard title="Contact" fonts={fonts}>
                <SettingsFormField
                  label="Téléphone"
                  value={form.phone}
                  onChangeText={(v) => updateField('phone', v)}
                  fonts={fonts}
                  keyboardType="phone-pad"
                  placeholder="+221…"
                />
                <SettingsFormField
                  label="Date de naissance"
                  value={form.birthDate}
                  onChangeText={(v) => updateField('birthDate', v)}
                  fonts={fonts}
                  placeholder="AAAA-MM-JJ"
                  autoCapitalize="none"
                />
                <SettingsFormField
                  label="Pays (code ISO)"
                  value={form.countryCode}
                  onChangeText={(v) => updateField('countryCode', v)}
                  fonts={fonts}
                  placeholder="SN, FR…"
                  autoCapitalize="none"
                />
              </SettingsSectionCard>

              <SettingsSectionCard title="Profil Quizz+" fonts={fonts}>
                <Text style={[styles.hint, fonts.medium && { fontFamily: fonts.medium }]}>
                  Type de compte
                </Text>
                <View style={styles.chips}>
                  {ACCOUNT_TYPES.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[styles.chip, form.accountTypeSlug === opt.value && styles.chipOn]}
                      onPress={() => updateField('accountTypeSlug', opt.value)}
                    >
                      <Text
                        style={[
                          styles.chipTxt,
                          form.accountTypeSlug === opt.value && styles.chipTxtOn,
                          fonts.semiBold && { fontFamily: fonts.semiBold },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.hint, fonts.medium && { fontFamily: fonts.medium }]}>
                  Contexte
                </Text>
                <View style={styles.chips}>
                  {WORKPLACES.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[styles.chip, form.workplaceSlug === opt.value && styles.chipOn]}
                      onPress={() => updateField('workplaceSlug', opt.value)}
                    >
                      <Text
                        style={[
                          styles.chipTxt,
                          form.workplaceSlug === opt.value && styles.chipTxtOn,
                          fonts.semiBold && { fontFamily: fonts.semiBold },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.meta, fonts.medium && { fontFamily: fonts.medium }]}>
                  {form.quizzesCompleted} quiz terminés · {form.totalScore} points cumulés
                </Text>
              </SettingsSectionCard>

              {error ? (
                <Text style={[styles.error, fonts.medium && { fontFamily: fonts.medium }]}>
                  {error.message}
                </Text>
              ) : null}
              {saved ? (
                <Text style={[styles.success, fonts.medium && { fontFamily: fonts.medium }]}>
                  Modifications enregistrées.
                </Text>
              ) : null}

              <Pressable
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={() => void save()}
                disabled={saving}
              >
                <LinearGradient
                  colors={['#FFD54A', '#FFB703']}
                  style={styles.saveGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {saving ? (
                    <ActivityIndicator color="#1F2261" />
                  ) : (
                    <Text style={[styles.saveTxt, fonts.bold && { fontFamily: fonts.bold }]}>
                      Enregistrer
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  inner: { width: '100%', maxWidth: SettingsScreenTheme.contentMaxWidth, gap: 20 },
  loader: { marginTop: 48 },
  hint: { fontSize: 13, color: '#757575', fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  chipOn: { backgroundColor: '#FFF8E1', borderColor: '#FFB703' },
  chipTxt: { fontSize: 13, fontWeight: '600', color: '#616161' },
  chipTxtOn: { color: '#1F2261' },
  meta: { fontSize: 13, color: '#9E9E9E', marginTop: 4 },
  error: { color: '#C62828', textAlign: 'center', fontSize: 14 },
  success: { color: '#2E7D32', textAlign: 'center', fontSize: 14 },
  saveBtn: { borderRadius: 100, overflow: 'hidden', marginTop: 4 },
  saveBtnDisabled: { opacity: 0.7 },
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  saveTxt: { fontSize: 17, fontWeight: '800', color: '#1F2261' },
});
