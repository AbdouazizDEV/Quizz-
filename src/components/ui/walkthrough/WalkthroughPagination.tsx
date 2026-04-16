import { StyleSheet, View } from 'react-native';

interface WalkthroughPaginationProps {
  total: number;
  activeIndex: number;
}

export function WalkthroughPagination({
  total,
  activeIndex,
}: WalkthroughPaginationProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <View
            key={index}
            style={[styles.dot, isActive ? styles.activeDot : styles.inactiveDot]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 100,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#FFD700',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#D9D9D9',
  },
});
