import { Image, StyleSheet, Text, View } from 'react-native';

import { QuizPlayTheme } from '@constants/quizPlayTheme';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface QuizQuestionHeaderProps {
  imageUri: string | null;
  questionText: string;
  fonts: ProfileFontFamilies;
}

export function QuizQuestionHeader({ imageUri, questionText, fonts }: QuizQuestionHeaderProps) {
  return (
    <View style={styles.block}>
      <View style={styles.mediaWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}
      </View>
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
  placeholder: {
    backgroundColor: '#DDD',
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
