import { Feather } from '@expo/vector-icons';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

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
  /** Quiz avec difficulté définie : cadenas pour les visiteurs (connexion requise). */
  lockedForVisitor?: boolean;
  onPress?: () => void;
}

export function CategoryQuizRow({
  item,
  fallbackThumbnailUri,
  fonts,
  lockedForVisitor,
  onPress,
}: CategoryQuizRowProps) {
  const uri = item.thumbnailUrl?.trim() || fallbackThumbnailUri;
  const meta = `${formatRelativeTimeFr(item.createdAt)} • ${formatCompactNumber(item.playCount)} joueurs`;

  const rowContent = (
    <View style={styles.cardRow} collapsable={false}>
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
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          lockedForVisitor
            ? `${item.title}, quiz réservé aux comptes connectés`
            : item.title
        }
        accessibilityHint={lockedForVisitor ? 'Ouvre la connexion pour débloquer ce quiz' : undefined}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          lockedForVisitor && styles.cardLocked,
          pressed && styles.pressed,
        ]}
      >
        {rowContent}
        {lockedForVisitor ? (
          <View
            style={[styles.lockedVeil, Platform.OS === 'android' ? styles.lockedVeilAndroid : null]}
            pointerEvents="none"
            collapsable={false}
            importantForAccessibility="no-hide-descendants"
          >
            <View style={[styles.filigranStripe, styles.filigranStripe1]} />
            <View style={[styles.filigranStripe, styles.filigranStripe2]} />
            <View style={[styles.filigranStripe, styles.filigranStripe3]} />
            <View style={styles.lockedCenter}>
              <View style={styles.lockCircle}>
                <Feather name="lock" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.lockedTitle, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
                Connexion requise
              </Text>
              <Text style={[styles.lockedSubtitle, fonts.medium && { fontFamily: fonts.medium }]}>
                Connectez-vous pour jouer à ce quiz
              </Text>
            </View>
          </View>
        ) : null}
      </Pressable>
    );
  }

  return <View style={styles.card}>{rowContent}</View>;
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    minHeight: 98,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    minHeight: 98,
  },
  pressed: {
    opacity: 0.92,
  },
  cardLocked: {
    borderWidth: 1,
    borderColor: 'rgba(33, 33, 33, 0.08)',
  },
  lockedVeil: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  lockedVeilAndroid: {
    elevation: 12,
  },
  filigranStripe: {
    position: 'absolute',
    width: 220,
    height: 20,
    backgroundColor: 'rgba(201, 160, 0, 0.09)',
    transform: [{ rotate: '-32deg' }],
  },
  filigranStripe1: {
    top: '8%',
    left: '-25%',
  },
  filigranStripe2: {
    top: '42%',
    left: '-15%',
    opacity: 0.85,
  },
  filigranStripe3: {
    top: '72%',
    left: '-30%',
    opacity: 0.7,
  },
  lockedCenter: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    maxWidth: '88%',
  },
  lockCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(33, 33, 33, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  lockedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
  },
  lockedSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#616161',
    textAlign: 'center',
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
