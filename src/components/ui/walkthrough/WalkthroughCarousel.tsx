import { RefObject, useEffect, useMemo } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { WalkthroughSlide } from '../../../types/walkthrough.types';

const SLIDE_GAP = 40;

interface WalkthroughCarouselProps {
  slides: WalkthroughSlide[];
  activeIndex: number;
  onScrollEnd: (index: number) => void;
  listRef: RefObject<FlatList<WalkthroughSlide> | null>;
  titleFontFamily?: string;
  /** Largeur utile d’une slide (écran − padding, plafonnée à la maquette). */
  slideWidth: number;
  /** Hauteur totale du carrousel (image + titre). */
  listHeight: number;
}

export function WalkthroughCarousel({
  slides,
  activeIndex,
  onScrollEnd,
  listRef,
  titleFontFamily,
  slideWidth,
  listHeight,
}: WalkthroughCarouselProps) {
  const { imageFrameHeight, titleFontSize, titleLineHeight, titleMinHeight } = useMemo(() => {
    const imageH = Math.min(300, Math.max(180, Math.round(slideWidth * 0.72)));
    const remaining = listHeight - SLIDE_GAP - imageH;
    const fs = slideWidth < 340 ? 18 : slideWidth < 380 ? 20 : 22;
    const lh = Math.round(fs * 1.35);
    return {
      imageFrameHeight: imageH,
      titleFontSize: fs,
      titleLineHeight: lh,
      titleMinHeight: Math.max(96, remaining),
    };
  }, [slideWidth, listHeight]);

  useEffect(() => {
    listRef.current?.scrollToIndex({
      index: activeIndex,
      animated: true,
    });
  }, [activeIndex, listRef]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const index = Math.round(contentOffset.x / layoutMeasurement.width);
    onScrollEnd(index);
  };

  return (
    <FlatList
      ref={listRef}
      data={slides}
      horizontal
      pagingEnabled
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={onMomentumScrollEnd}
      renderItem={({ item }) => (
        <View style={[styles.slide, { width: slideWidth, minHeight: listHeight }]}>
          <View style={[styles.imageFrame, { width: slideWidth, height: imageFrameHeight }]}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
          </View>
          <Text
            style={[
              styles.title,
              {
                width: slideWidth,
                minHeight: titleMinHeight,
                fontSize: titleFontSize,
                lineHeight: titleLineHeight,
              },
              titleFontFamily ? { fontFamily: titleFontFamily } : undefined,
            ]}
          >
            {item.title}
          </Text>
        </View>
      )}
      getItemLayout={(_, index) => ({
        length: slideWidth,
        offset: slideWidth * index,
        index,
      })}
      style={[styles.list, { width: slideWidth, height: listHeight }]}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    alignSelf: 'center',
  },
  slide: {
    alignItems: 'center',
    gap: SLIDE_GAP,
  },
  imageFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    paddingHorizontal: 4,
    fontWeight: '700',
    textAlign: 'center',
    color: '#212121',
  },
});
