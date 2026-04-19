import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { CategoryExploreItem } from '@app-types/categoryExplore.types';
import { getCategoryCoverUrl } from '@utils/categoryCoverUrl';

interface HomeDailyCategoriesSectionProps {
  categories: CategoryExploreItem[];
  loading: boolean;
  onPressCategory: (slug: string) => void;
}

export function HomeDailyCategoriesSection({
  categories,
  loading,
  onPressCategory,
}: HomeDailyCategoriesSectionProps) {
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#B88700" />
      </View>
    );
  }

  return (
    <View style={styles.column}>
      {categories.map((cat) => {
        const cover = getCategoryCoverUrl(cat.slug);
        const meta =
          cat.quizCount === 0
            ? 'Aucun quiz pour l’instant'
            : cat.quizCount === 1
              ? '1 quiz'
              : `${cat.quizCount} quiz`;

        return (
          <Pressable
            key={cat.id}
            accessibilityRole="button"
            accessibilityLabel={`${cat.name}, ${meta}`}
            onPress={() => onPressCategory(cat.slug)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <Image source={{ uri: cover }} style={styles.thumb} />
            <View style={styles.textWrap}>
              <Text style={styles.title}>{cat.name}</Text>
              <Text style={styles.meta}>{meta}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#A1A1AA" />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 10,
  },
  loading: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: '#6B7280',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
