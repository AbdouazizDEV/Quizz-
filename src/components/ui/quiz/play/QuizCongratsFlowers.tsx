import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const FLOWERS = ['🌸', '🌺', '🌼', '🌻', '💐', '🌷', '🪷', '✿'];

interface QuizCongratsFlowersProps {
  active: boolean;
}

/** Défilement vertical décoratif (couche « spectaculaire »). */
export function QuizCongratsFlowers({ active }: QuizCongratsFlowersProps) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    y.setValue(0);
    const loop = Animated.loop(
      Animated.timing(y, {
        toValue: 1,
        duration: 14000,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [active, y]);

  if (!active) return null;

  const translateY = y.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -420],
  });

  return (
    <View style={styles.layer} pointerEvents="none">
      <Animated.View style={[styles.column, { transform: [{ translateY }] }]}>
        {[...FLOWERS, ...FLOWERS, ...FLOWERS].map((f, i) => (
          <Text key={`${f}-${i}`} style={[styles.emoji, { marginLeft: (i % 5) * 18 }]}>
            {f}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  column: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    gap: 28,
    paddingTop: 40,
  },
  emoji: {
    fontSize: 42,
    opacity: 0.85,
  },
});
