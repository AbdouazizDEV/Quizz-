import { Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { ProfileQuizListItem } from '@app-types/profile.types';
import { ProfileTheme } from '@constants/profileTheme';

import type { ProfileFontFamilies } from './ProfileFonts';

interface ProfileQuizCardProps {
  item: ProfileQuizListItem;
  fonts: ProfileFontFamilies;
}

export function ProfileQuizCard({ item, fonts }: ProfileQuizCardProps) {
  const isPublic = item.visibility === 'public';
  const meta = `${item.relativeTimeLabel} • ${item.playCount} plays`;

  return (
    <View style={styles.card}>
      <View style={styles.thumbWrap}>
        <Image source={{ uri: item.thumbnailUri }} style={styles.thumb} />
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
        <View style={styles.privacyRow}>
          <Feather name={isPublic ? 'users' : 'lock'} size={14} color={ProfileTheme.grey700} />
          <Text style={[styles.privacy, fonts.medium && { fontFamily: fonts.medium }]}>
            {isPublic ? 'Public' : 'Only Me'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ProfileTheme.grey200,
    backgroundColor: ProfileTheme.white,
  },
  thumbWrap: {
    width: 88,
    height: 88,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    left: 6,
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
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  privacy: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: ProfileTheme.grey700,
  },
});
