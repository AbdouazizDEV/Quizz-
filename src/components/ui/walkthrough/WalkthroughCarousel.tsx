import { RefObject, useEffect } from 'react';
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

interface WalkthroughCarouselProps {
  slides: WalkthroughSlide[];
  activeIndex: number;
  onScrollEnd: (index: number) => void;
  listRef: RefObject<FlatList<WalkthroughSlide> | null>;
  titleFontFamily?: string;
}

export function WalkthroughCarousel({
  slides,
  activeIndex,
  onScrollEnd,
  listRef,
  titleFontFamily,
}: WalkthroughCarouselProps) {
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
        <View style={styles.slide}>
          <View style={styles.imageFrame}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
          </View>
          <Text style={[styles.title, titleFontFamily ? { fontFamily: titleFontFamily } : undefined]}>
            {item.title}
          </Text>
        </View>
      )}
      getItemLayout={(_, index) => ({
        length: 382,
        offset: 382 * index,
        index,
      })}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    width: 382,
    height: 493,
  },
  slide: {
    width: 382,
    alignItems: 'center',
    gap: 40,
  },
  imageFrame: {
    width: 382,
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    width: 382,
    height: 153,
    fontSize: 22,
    lineHeight: 51,
    fontWeight: '700',
    textAlign: 'center',
    color: '#212121',
  },
});
