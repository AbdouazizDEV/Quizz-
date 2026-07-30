import { Image, StyleSheet, Text, View } from 'react-native';

import { QuizPlayTheme } from '@constants/quizPlayTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface QuizQuestionHeaderProps {
  /** Illustration dédiée à la question ; masquée si absente (prévu pour plus tard). */
  imageUri?: string | null;
  questionText: string;
  fonts: ProfileFontFamilies;
}

export function QuizQuestionHeader({ imageUri, questionText, fonts }: QuizQuestionHeaderProps) {
  const resolvedImage = imageUri?.trim() || null;

  return (
    <View style={styles.block}>
      {resolvedImage ? (
        <View style={styles.mediaWrap}>
          <Image source={{ uri: resolvedImage }} style={styles.image} resizeMode="cover" />
        </View>
      ) : null}
      <Text style={[styles.question, fonts.bold && { fontFamily: fonts.bold }]}>{questionText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  mediaWrap: {
    width: '100%',
    height: QuizPlayTheme.questionImageHeight,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#ECECEC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  question: {
    width: '100%',
    minHeight: 76,
    fontSize: 24,
    lineHeight: 38,
    fontWeight: '700',
    textAlign: 'center',
    color: QuizPlayTheme.grey900,
  },
});
