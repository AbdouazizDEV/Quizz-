import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProfileQuizListItem, ProfileTabId } from '@app-types/profile.types';
import { ProfileTheme } from '@constants/profileTheme';

import type { ProfileFontFamilies } from './ProfileFonts';
import { ProfileQuizCard } from './ProfileQuizCard';
import { ProfileQuizzListHeader } from './ProfileQuizzListHeader';

const INITIAL_VISIBLE = 10;

interface ProfileTabContentProps {
  tab: ProfileTabId;
  quizTotalCount: number;
  quizzes: ProfileQuizListItem[];
  fonts: ProfileFontFamilies;
}

export function ProfileTabContent({ tab, quizTotalCount, quizzes, fonts }: ProfileTabContentProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleQuizzes = useMemo(() => {
    if (expanded) return quizzes;
    return quizzes.slice(0, INITIAL_VISIBLE);
  }, [expanded, quizzes]);

  const hasMore = quizzes.length > INITIAL_VISIBLE;
  const displayCount = Math.max(quizTotalCount, quizzes.length);

  if (tab === 'collections') {
    return (
      <View style={styles.placeholder}>
        <Text style={[styles.placeholderText, fonts.medium && { fontFamily: fonts.medium }]}>
          Vos trophées apparaîtront ici.
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

  const title = `${displayCount} quiz`;

  return (
    <View style={styles.quizzPanel}>
      <ProfileQuizzListHeader title={title} sortLabel="Plus récents" fonts={fonts} />
      {visibleQuizzes.length === 0 ? (
        <View style={styles.placeholder}>
          <Text style={[styles.placeholderText, fonts.medium && { fontFamily: fonts.medium }]}>
            Aucune partie récente à afficher pour le moment.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {visibleQuizzes.map((q) => (
            <ProfileQuizCard key={q.id} item={q} fonts={fonts} />
          ))}
        </View>
      )}
      {hasMore ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setExpanded((v) => !v)}
          style={({ pressed }) => [styles.seeMoreBtn, pressed && { opacity: 0.88 }]}
        >
          <Text style={[styles.seeMoreText, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
            {expanded ? 'Réduire' : 'Voir plus'}
          </Text>
        </Pressable>
      ) : null}
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
  seeMoreBtn: {
    marginTop: 12,
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: '#FFB703',
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2261',
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
