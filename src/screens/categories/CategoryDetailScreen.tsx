import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryQuizRow } from '@components/ui/categories/CategoryQuizRow';
import { ProfileQuizzListHeader } from '@components/ui/profile/ProfileQuizzListHeader';
import { StatisticsNavbar } from '@components/ui/statistics/StatisticsNavbar';
import type { QuizSortMode } from '@app-types/categoryExplore.types';
import { buildQuizEntryHref, Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';
import { useCategoryDetail } from '@hooks/useCategoryDetail';
import { getCategoryCoverUrl } from '@utils/categoryCoverUrl';

export default function CategoryDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { slug: slugParam } = useLocalSearchParams<{ slug: string | string[] }>();
  const slug =
    typeof slugParam === 'string' ? slugParam : Array.isArray(slugParam) ? slugParam[0] : undefined;
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, Spacing.onboardingMaxWidth);

  const [sort, setSort] = useState<QuizSortMode>('default');
  const sortLabel = sort === 'default' ? 'Par défaut' : 'Plus récents';

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

  const { data, loading, error, refetch } = useCategoryDetail(slug, sort);

  const coverUri = useMemo(() => (slug ? getCategoryCoverUrl(slug) : ''), [slug]);

  const onBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(Routes.CATEGORIES);
  }, [router]);

  const onSearch = useCallback(() => {
    Alert.alert('Recherche', 'Fonctionnalité à venir.');
  }, []);

  const onSort = useCallback(() => {
    setSort((prev) => (prev === 'default' ? 'newest' : 'default'));
  }, []);

  const title = data?.category.name ?? '';

  if (!slug) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#FFFFFF', '#F8F8F8']} style={StyleSheet.absoluteFillObject} />
        <View style={[styles.centered, { paddingTop: insets.top }]}>
          <Text style={styles.errorText}>Catégorie introuvable.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', '#F8F8F8']} style={StyleSheet.absoluteFillObject} />

      {loading && !data ? (
        <View style={[styles.centered, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="#212121" />
        </View>
      ) : error && !data ? (
        <View style={[styles.centered, { paddingTop: insets.top, paddingHorizontal: 24 }]}>
          <Text style={styles.errorText}>{error.message}</Text>
          <Text style={styles.retry} onPress={() => refetch()}>
            Réessayer
          </Text>
        </View>
      ) : data ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 16,
              paddingHorizontal: Spacing.screenHorizontal,
              paddingBottom: 48 + insets.bottom,
              gap: 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.inner, { width: contentWidth, maxWidth: contentWidth }]}>
            <StatisticsNavbar
              title={title}
              fonts={fonts}
              onBack={onBack}
              rightAction={{ type: 'search', onPress: onSearch }}
            />

            <Image source={{ uri: coverUri }} style={styles.hero} resizeMode="cover" />

            <ProfileQuizzListHeader
              title={`${data.category.quizCount} Quizz`}
              sortLabel={sortLabel}
              fonts={fonts}
              onPressSort={onSort}
            />

            <View style={styles.list}>
              {data.quizzes.length === 0 ? (
                <Text style={[styles.emptyList, fonts.medium && { fontFamily: fonts.medium }]}>
                  Aucun quiz publié dans cette catégorie pour le moment.
                </Text>
              ) : (
                data.quizzes.map((q) => (
                  <CategoryQuizRow
                    key={q.id}
                    item={q}
                    fallbackThumbnailUri={coverUri}
                    fonts={fonts}
                    onPress={() => router.push(buildQuizEntryHref(q.id, slug))}
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: {
    alignItems: 'center',
    gap: 20,
  },
  inner: {
    alignItems: 'flex-start',
    gap: 0,
  },
  hero: {
    width: '100%',
    height: 230,
    borderRadius: 16,
    backgroundColor: '#E8E8E8',
    marginBottom: 4,
  },
  list: {
    width: '100%',
    gap: 20,
  },
  emptyList: {
    fontSize: 15,
    color: '#616161',
    lineHeight: 22,
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
