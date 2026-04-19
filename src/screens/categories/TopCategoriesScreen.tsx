import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
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

import { CategoryExploreGridCard } from '@components/ui/categories/CategoryExploreGridCard';
import { StatisticsNavbar } from '@components/ui/statistics/StatisticsNavbar';
import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { useCategoriesExplore } from '@hooks/useCategoriesExplore';

export default function TopCategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, Spacing.onboardingMaxWidth);

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

  const { data: categories, loading, error, refetch } = useCategoriesExplore();

  const { cardW, cardH, rowGap, colGap } = useMemo(() => {
    const gap = 16;
    const h = 120;
    const w = (contentWidth - gap) / 2;
    return { cardW: w, cardH: h, rowGap: 20, colGap: gap };
  }, [contentWidth]);

  const rows = useMemo(() => {
    const chunk: (typeof categories)[] = [];
    for (let i = 0; i < categories.length; i += 2) {
      chunk.push(categories.slice(i, i + 2));
    }
    return chunk;
  }, [categories]);

  const onBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(Routes.HOME);
  }, [router]);

  const onSearch = useCallback(() => {
    Alert.alert('Recherche', 'Fonctionnalité à venir.');
  }, []);

  const goCategory = useCallback(
    (categorySlug: string) => {
      router.push(`${Routes.CATEGORIES}/${categorySlug}`);
    },
    [router],
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', '#F8F8F8']} style={StyleSheet.absoluteFillObject} />

      {loading && !categories.length ? (
        <View style={[styles.centered, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="#212121" />
        </View>
      ) : error ? (
        <View style={[styles.centered, { paddingTop: insets.top, paddingHorizontal: 24 }]}>
          <Text style={styles.errorText}>Impossible de charger les catégories.</Text>
          <Text style={styles.retry} onPress={() => refetch()}>
            Réessayer
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 16,
              paddingHorizontal: Spacing.screenHorizontal,
              paddingBottom: 48 + insets.bottom,
              gap: 28,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.inner, { width: contentWidth, maxWidth: contentWidth }]}>
            <StatisticsNavbar
              title="Top catégories"
              fonts={fonts}
              onBack={onBack}
              rightAction={{ type: 'search', onPress: onSearch }}
            />

            <View style={[styles.body, { gap: rowGap }]}>
              {rows.map((row, ri) => (
                <View key={`row-${ri}`} style={[styles.row, { gap: colGap }]}>
                  {row.map((cat) => (
                    <CategoryExploreGridCard
                      key={cat.id}
                      name={cat.name}
                      slug={cat.slug}
                      width={cardW}
                      height={cardH}
                      onPress={() => goCategory(cat.slug)}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: {
    alignItems: 'center',
  },
  inner: {
    alignItems: 'flex-start',
    gap: 24,
  },
  body: {
    width: '100%',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: '#616161',
    textAlign: 'center',
  },
  retry: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C9A000',
  },
});
