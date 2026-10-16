import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ArenaEdition, ArenaRegistration } from '@app-types/arena.types';
import { ArenaCalendarSection } from '@components/ui/arena/ArenaCalendarSection';
import { ArenaCampusPicker } from '@components/ui/arena/ArenaCampusPicker';
import { ArenaHeroBanner } from '@components/ui/arena/ArenaHeroBanner';
import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { StatisticsNavbar } from '@components/ui/statistics/StatisticsNavbar';
import { Colors } from '@constants/Colors';
import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { invalidateAuthMeCache } from '@services/auth/authMeRepository';
import {
  fetchArenaEdition,
  fetchArenaMe,
  patchArenaCampus,
  registerArenaCampus,
} from '@services/arena/arenaRepository';
import { useAuthStore } from '@stores/authStore';
import {
  arenaDocumentStatusMessage,
  sortArenaCampuses,
} from '@utils/arenaDisplay';

const fonts = { bold: undefined as string | undefined, semiBold: undefined as string | undefined };

type LoadPhase = 'idle' | 'loading' | 'ready' | 'error';
type MePhase = 'idle' | 'loading' | 'ready' | 'error';

export default function ArenaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const authRedirectedRef = useRef(false);

  const [phase, setPhase] = useState<LoadPhase>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [edition, setEdition] = useState<ArenaEdition | null>(null);
  const [registration, setRegistration] = useState<ArenaRegistration | null>(null);
  const [mePhase, setMePhase] = useState<MePhase>('idle');
  const [meError, setMeError] = useState<string | null>(null);

  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null);
  const [registerBusy, setRegisterBusy] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [campusEditOpen, setCampusEditOpen] = useState(false);
  const [campusDraftId, setCampusDraftId] = useState<string | null>(null);
  const [campusBusy, setCampusBusy] = useState(false);
  const [campusError, setCampusError] = useState<string | null>(null);

  const campuses = useMemo(
    () => (edition ? sortArenaCampuses(edition.campuses) : []),
    [edition],
  );

  const loadArena = useCallback(async () => {
    if (!token?.trim()) return;
    setPhase('loading');
    setMePhase('loading');
    setLoadError(null);
    setMeError(null);
    try {
      const editionRes = await fetchArenaEdition();
      setEdition(editionRes);
      setPhase('ready');
    } catch {
      setLoadError(
        'Impossible de joindre l’API Arena. Vérifiez votre connexion ou EXPO_PUBLIC_API_URL (ex. https://api.quizzp.com/api/v1).',
      );
      setPhase('error');
      setMePhase('idle');
      return;
    }
    try {
      const meRes = await fetchArenaMe();
      setRegistration(meRes.registration);
      setMePhase('ready');
    } catch {
      setMeError('Impossible de charger ton inscription pour le moment.');
      setMePhase('error');
    }
  }, [token]);

  useEffect(() => {
    if (!hydrated) return;
    if (!token?.trim()) {
      if (authRedirectedRef.current) return;
      authRedirectedRef.current = true;
      router.replace({
        pathname: Routes.LOGIN,
        params: { returnTo: Routes.ARENA },
      });
      return;
    }
    void loadArena();
  }, [hydrated, token, router, loadArena]);

  const onConfirmRegistration = useCallback(async () => {
    if (!selectedCampusId || registerBusy) return;
    setRegisterError(null);
    setRegisterBusy(true);
    try {
      const result = await registerArenaCampus(selectedCampusId);
      setRegistration(result.registration);
      await invalidateAuthMeCache();
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Inscription impossible.');
    } finally {
      setRegisterBusy(false);
    }
  }, [registerBusy, selectedCampusId]);

  const onConfirmCampusChange = useCallback(async () => {
    if (!campusDraftId || campusBusy) return;
    setCampusError(null);
    setCampusBusy(true);
    try {
      const updated = await patchArenaCampus(campusDraftId);
      setRegistration(updated);
      setCampusEditOpen(false);
      setCampusDraftId(null);
    } catch (error) {
      setCampusError(error instanceof Error ? error.message : 'Changement impossible.');
    } finally {
      setCampusBusy(false);
    }
  }, [campusBusy, campusDraftId]);

  const documentMessage = arenaDocumentStatusMessage(registration?.document_status);

  const showRegistrationForm =
    phase === 'ready' && edition != null && mePhase === 'ready' && registration == null;
  const showRegistered =
    phase === 'ready' && edition != null && mePhase === 'ready' && registration != null;
  const showMeLoading = phase === 'ready' && edition != null && mePhase === 'loading';

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', Colors.background]} style={StyleSheet.absoluteFillObject} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: Spacing.screenHorizontal,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <StatisticsNavbar title="Arena" fonts={fonts} onBack={() => router.back()} fullWidth />

        {!hydrated ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Initialisation de la session…</Text>
          </View>
        ) : null}

        {hydrated && phase === 'loading' ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Chargement du calendrier Arena…</Text>
          </View>
        ) : null}

        {phase === 'error' ? (
          <DefisSurfaceCard style={styles.errorCard}>
            <Text style={styles.errorTitle}>Arena indisponible</Text>
            <Text style={styles.errorBody}>{loadError}</Text>
            <Pressable style={styles.retryBtn} onPress={() => void loadArena()}>
              <Text style={styles.retryText}>Réessayer</Text>
            </Pressable>
          </DefisSurfaceCard>
        ) : null}

        {edition && phase === 'ready' ? (
          <>
            <ArenaHeroBanner
              premiumExpiresAt={edition.premium_expires_at}
              timezone={edition.timezone}
            />

            {showMeLoading ? (
              <DefisSurfaceCard style={styles.formCard}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.formHint}>Chargement de ton inscription…</Text>
              </DefisSurfaceCard>
            ) : null}

            {mePhase === 'error' ? (
              <DefisSurfaceCard style={styles.errorCard}>
                <Text style={styles.errorBody}>{meError}</Text>
                <Pressable
                  style={styles.retryBtn}
                  onPress={() => {
                    setMePhase('loading');
                    setMeError(null);
                    void fetchArenaMe()
                      .then((meRes) => {
                        setRegistration(meRes.registration);
                        setMePhase('ready');
                      })
                      .catch(() => {
                        setMeError('Impossible de charger ton inscription pour le moment.');
                        setMePhase('error');
                      });
                  }}
                >
                  <Text style={styles.retryText}>Réessayer</Text>
                </Pressable>
              </DefisSurfaceCard>
            ) : null}

            {showRegistered ? (
              <DefisSurfaceCard style={styles.registeredCard}>
                <Text style={styles.cardTitle}>Ton inscription</Text>
                <Text style={styles.registeredCampus}>{registration.campus.name}</Text>
                <Text style={styles.metaLine}>Statut : {registration.status}</Text>
                {documentMessage ? <Text style={styles.docLine}>{documentMessage}</Text> : null}

                {!campusEditOpen ? (
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => {
                      setCampusEditOpen(true);
                      setCampusDraftId(registration.campus.id);
                      setCampusError(null);
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>Changer de campus</Text>
                  </Pressable>
                ) : (
                  <View style={styles.editBlock}>
                    <Text style={styles.editHint}>Choisis un nouveau campus, puis confirme.</Text>
                    <ArenaCampusPicker
                      campuses={campuses}
                      selectedId={campusDraftId}
                      onSelect={setCampusDraftId}
                      disabled={campusBusy}
                    />
                    {campusError ? <Text style={styles.inlineError}>{campusError}</Text> : null}
                    <View style={styles.editActions}>
                      <Pressable
                        style={styles.ghostBtn}
                        disabled={campusBusy}
                        onPress={() => {
                          setCampusEditOpen(false);
                          setCampusDraftId(null);
                          setCampusError(null);
                        }}
                      >
                        <Text style={styles.ghostBtnText}>Annuler</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.primaryBtn,
                          (!campusDraftId || campusBusy) && styles.primaryBtnDisabled,
                        ]}
                        disabled={!campusDraftId || campusBusy}
                        onPress={() => void onConfirmCampusChange()}
                      >
                        {campusBusy ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={styles.primaryBtnText}>Confirmer le changement</Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                )}
              </DefisSurfaceCard>
            ) : null}

            {showRegistrationForm ? (
              <DefisSurfaceCard style={styles.formCard}>
                <Text style={styles.cardTitle}>Choisis ton campus</Text>
                <Text style={styles.formHint}>
                  Un seul campus pour l’édition {edition.edition_key}. L’inscription active le premium
                  Arena jusqu’à la fin de l’édition.
                </Text>
                {campuses.length === 0 ? (
                  <Text style={styles.formHint}>Aucun campus disponible pour le moment.</Text>
                ) : (
                  <ArenaCampusPicker
                    campuses={campuses}
                    selectedId={selectedCampusId}
                    onSelect={setSelectedCampusId}
                    disabled={registerBusy}
                  />
                )}
                {registerError ? <Text style={styles.inlineError}>{registerError}</Text> : null}
                <Pressable
                  style={[
                    styles.primaryBtn,
                    (!selectedCampusId || registerBusy || campuses.length === 0) &&
                      styles.primaryBtnDisabled,
                  ]}
                  disabled={!selectedCampusId || registerBusy || campuses.length === 0}
                  onPress={() => void onConfirmRegistration()}
                >
                  {registerBusy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Confirmer l’inscription</Text>
                  )}
                </Pressable>
              </DefisSurfaceCard>
            ) : null}

            <ArenaCalendarSection edition={edition} />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { gap: 18, maxWidth: Spacing.onboardingMaxWidth, width: '100%', alignSelf: 'center' },
  loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12 },
  loadingText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  errorCard: { gap: 10 },
  errorTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  errorBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  retryBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  registeredCard: { gap: 10 },
  formCard: { gap: 14 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  formHint: { fontSize: 13, lineHeight: 19, color: Colors.textSecondary, fontWeight: '600' },
  registeredCampus: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  metaLine: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  docLine: { fontSize: 13, lineHeight: 19, color: Colors.secondary, fontWeight: '700' },
  inlineError: { fontSize: 13, fontWeight: '700', color: Colors.danger, lineHeight: 18 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  secondaryBtn: {
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    borderRadius: 999,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  editBlock: { gap: 12, marginTop: 8 },
  editHint: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  editActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  ghostBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  ghostBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
});
