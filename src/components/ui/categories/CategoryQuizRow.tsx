import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { CategoryQuizListItem } from '@app-types/categoryExplore.types';
import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';
import { ProfileTheme } from '@constants/profileTheme';
import { formatCompactNumber } from '@utils/formatCompactNumber';
import { formatRelativeTimeFr } from '@utils/formatRelativeTimeFr';

interface CategoryQuizRowProps {
  item: CategoryQuizListItem;
  /** Image de secours si `thumbnailUrl` est vide (ex. couverture de catégorie). */
  fallbackThumbnailUri: string;
  fonts: ProfileFontFamilies;
  onPress?: () => void;
}

export function CategoryQuizRow({ item, fallbackThumbnailUri, fonts, onPress }: CategoryQuizRowProps) {
  const uri = item.thumbnailUrl?.trim() || fallbackThumbnailUri;
  const meta = `${formatRelativeTimeFr(item.createdAt)} • ${formatCompactNumber(item.playCount)} joueurs`;

  const body = (
    <>
      <View style={styles.thumbWrap}>
        <Image source={{ uri }} style={styles.thumb} />
        <View style={styles.badge}>
          <Text style={[styles.badgeText, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
            {item.questionCount} Qs
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.meta, fonts.medium && { fontFamily: fonts.medium }]}>{meta}</Text>
        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>Q</Text>
          </View>
          <Text style={[styles.authorName, fonts.medium && { fontFamily: fonts.medium }]}>Quizz+</Text>
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={styles.card}>{body}</View>;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    minHeight: 98,
  },
  pressed: {
    opacity: 0.92,
  },
  thumbWrap: {
    width: 98,
    height: 98,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    backgroundColor: ProfileTheme.primary500,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: ProfileTheme.white,
  },
  body: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: ProfileTheme.grey900,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: ProfileTheme.grey700,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  authorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    fontSize: 11,
    fontWeight: '700',
    color: ProfileTheme.grey700,
  },
  authorName: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: ProfileTheme.grey700,
  },
});
