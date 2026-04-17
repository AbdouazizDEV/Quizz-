import { LinearGradient } from 'expo-linear-gradient';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export interface HomeInsightItem {
  id: string;
  title: string;
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
}

export function HomeInsightCarousel({
  insights,
  contentWidth,
  activeIndex,
  onChangeIndex,
  carouselRef,
}: HomeInsightCarouselProps) {
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
            <Text style={styles.insightTag}>{item.tag}</Text>
            <Text style={styles.insightTitle}>{item.title}</Text>
            <Text style={styles.insightBody}>{item.body}</Text>
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
    gap: 12,
  },
  insightCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 10,
    minHeight: 152,
  },
  insightTag: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  insightTitle: {
    color: '#212121',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
  },
  insightBody: {
    color: '#424242',
    fontSize: 15,
    lineHeight: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    width: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.87)',
  },
});
