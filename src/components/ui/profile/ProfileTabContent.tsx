import { StyleSheet, Text, View } from 'react-native';

import type { ProfileQuizListItem, ProfileTabId } from '@app-types/profile.types';
import { ProfileTheme } from '@constants/profileTheme';

import type { ProfileFontFamilies } from './ProfileFonts';
import { ProfileQuizCard } from './ProfileQuizCard';
import { ProfileQuizzListHeader } from './ProfileQuizzListHeader';

interface ProfileTabContentProps {
  tab: ProfileTabId;
  quizTotalCount: number;
  quizzes: ProfileQuizListItem[];
  fonts: ProfileFontFamilies;
}

export function ProfileTabContent({ tab, quizTotalCount, quizzes, fonts }: ProfileTabContentProps) {
  if (tab === 'collections') {
    return (
      <View style={styles.placeholder}>
        <Text style={[styles.placeholderText, fonts.medium && { fontFamily: fonts.medium }]}>
          Vos collections apparaîtront ici.
        </Text>
      </View>
    );
  }

  if (tab === 'about') {
    return (
      <View style={styles.placeholder}>
        <Text style={[styles.placeholderText, fonts.medium && { fontFamily: fonts.medium }]}>
          À propos — contenu à venir.
        </Text>
      </View>
    );
  }

  const title = `${quizTotalCount} Quizz`;

  return (
    <View style={styles.quizzPanel}>
      <ProfileQuizzListHeader title={title} sortLabel="Newest" fonts={fonts} />
      <View style={styles.list}>
        {quizzes.map((q) => (
          <ProfileQuizCard key={q.id} item={q} fonts={fonts} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quizzPanel: {
    width: '100%',
    gap: 4,
  },
  list: {
    gap: 12,
  },
  placeholder: {
    paddingVertical: 32,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
    color: ProfileTheme.grey700,
  },
});
