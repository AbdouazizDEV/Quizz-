import { ImageBackground, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { getCategoryCoverUrl } from '@utils/categoryCoverUrl';

interface CategoryExploreGridCardProps {
  name: string;
  slug: string;
  width: number;
  height: number;
  onPress: () => void;
}

export function CategoryExploreGridCard({ name, slug, width, height, onPress }: CategoryExploreGridCardProps) {
  const uri = getCategoryCoverUrl(slug);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Catégorie ${name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.press, { width, height }, pressed && styles.pressed]}
    >
      <ImageBackground source={{ uri }} style={styles.image} imageStyle={styles.imageRadius}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.72)']}
          style={styles.gradient}
        >
          <Text style={styles.title} numberOfLines={2}>
            {name}
          </Text>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageRadius: {
    borderRadius: 16,
  },
  gradient: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'flex-end',
    minHeight: '45%',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
});
