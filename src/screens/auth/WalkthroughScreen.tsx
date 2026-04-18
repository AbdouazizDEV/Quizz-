import { Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WalkthroughBottomBar } from '@components/ui/walkthrough/WalkthroughBottomBar';
import { WalkthroughCarousel } from '@components/ui/walkthrough/WalkthroughCarousel';
import { WalkthroughPagination } from '@components/ui/walkthrough/WalkthroughPagination';
import { onboardingColumn } from '@constants/layout';
import { Spacing } from '@constants/Spacing';
import { Routes } from '@constants/Routes';
import { useAutoCarousel } from '@hooks/useAutoCarousel';
import type { WalkthroughSlide } from '../../types/walkthrough.types';

const SLIDES: WalkthroughSlide[] = [
  {
    id: 'slide-1',
    title: 'Créez, partagez et jouez à des quiz quand et où vous le souhaitez',
    image: require('../../../assets/icons/image1.png'),
  },
  {
    id: 'slide-2',
    title: 'Trouvez des quiz amusants et intéressants pour améliorer vos connaissances',
    image: require('../../../assets/icons/image2.png'),
  },
  {
    id: 'slide-3',
    title: 'Jouez et relevez des défis de quiz avec vos amis.',
    image: require('../../../assets/icons/image3.png'),
  },
];

export default function WalkthroughScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList<WalkthroughSlide> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fontsLoaded] = useFonts({ Nunito_700Bold });
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const slides = useMemo(() => SLIDES, []);

  const slideWidth = Math.min(
    windowWidth - Spacing.screenHorizontal * 2,
    Spacing.onboardingMaxWidth,
  );

  const listHeight = useMemo(() => {
    const bottomBarReserve = 200 + Math.max(16, insets.bottom);
    const topReserve = Spacing.lg + insets.top;
    const paginationBlock = 48;
    const available =
      windowHeight -
      topReserve -
      bottomBarReserve -
      paginationBlock -
      Spacing.xl;
    return Math.max(260, Math.min(520, available));
  }, [windowHeight, insets.top, insets.bottom]);

  useAutoCarousel({
    itemCount: slides.length,
    intervalMs: 3_000,
    setIndex: setActiveIndex,
  });

  const onPressStart = () => {
    router.push(Routes.CREATE_ACCOUNT_TYPE);
  };

  const onPressSignin = () => {
    router.push(Routes.LOGIN);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View
        style={[
          styles.main,
          {
            paddingTop: Spacing.lg + insets.top,
            paddingHorizontal: Spacing.screenHorizontal,
            paddingBottom: 200 + Math.max(16, insets.bottom),
          },
        ]}
      >
        <View style={[styles.column, onboardingColumn]}>
          <View style={styles.carouselWrap}>
            <WalkthroughCarousel
              slides={slides}
              activeIndex={activeIndex}
              onScrollEnd={setActiveIndex}
              listRef={listRef}
              titleFontFamily={fontsLoaded ? 'Nunito_700Bold' : undefined}
              slideWidth={slideWidth}
              listHeight={listHeight}
            />
          </View>
          <View style={styles.paginationWrap}>
            <WalkthroughPagination total={slides.length} activeIndex={activeIndex} />
          </View>
        </View>
      </View>

      <WalkthroughBottomBar
        onPressStart={onPressStart}
        onPressSignin={onPressSignin}
        buttonFontFamily={fontsLoaded ? 'Nunito_700Bold' : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  main: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
  },
  column: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  carouselWrap: {
    flexShrink: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.sm,
  },
});
