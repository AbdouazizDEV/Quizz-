import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

export interface HomeInsightItem {
  id: string;
  body: string;
  tag: string;
  gradient: readonly [string, string];
}

interface HomeInsightCarouselProps {
  insights: HomeInsightItem[];
  contentWidth: number;
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  carouselRef: React.RefObject<FlatList<HomeInsightItem> | null>;
  loading?: boolean;
}

export function HomeInsightCarousel({
  insights,
  contentWidth,
  activeIndex,
  onChangeIndex,
  carouselRef,
  loading = false,
}: HomeInsightCarouselProps) {
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#B88700" />
      </View>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <FlatList
        ref={carouselRef}
        horizontal
        pagingEnabled
        data={insights}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const idx = Math.round(event.nativeEvent.contentOffset.x / contentWidth);
          onChangeIndex(Math.max(0, Math.min(idx, insights.length - 1)));
        }}
        getItemLayout={(_, index) => ({
          index,
          length: contentWidth,
          offset: contentWidth * index,
        })}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={[styles.insightCard, { width: contentWidth }]}>
            <Text style={styles.insightTag} numberOfLines={1}>
              {item.tag}
            </Text>
            <Text style={styles.insightBody} numberOfLines={3}>
              {item.body}
            </Text>
          </LinearGradient>
        )}
      />
      <View style={styles.dotsRow}>
        {insights.map((item, idx) => (
          <View key={item.id} style={[styles.dot, idx === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  loadingWrap: {
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCard: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    minHeight: 88,
    justifyContent: 'center',
  },
  insightTag: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  insightBody: {
    color: '#212121',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    width: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.87)',
  },
});
