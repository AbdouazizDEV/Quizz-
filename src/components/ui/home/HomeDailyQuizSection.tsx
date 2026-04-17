import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface HomeQuizItem {
  id: string;
  title: string;
  questions: number;
  difficulty: string;
  icon: React.ComponentProps<typeof Feather>['name'];
}

interface HomeDailyQuizSectionProps {
  quizzes: HomeQuizItem[];
}

export function HomeDailyQuizSection({ quizzes }: HomeDailyQuizSectionProps) {
  return (
    <View style={styles.quizColumn}>
      {quizzes.map((quiz) => (
        <Pressable key={quiz.id} style={({ pressed }) => [styles.quizCard, pressed && styles.pressed]}>
          <View style={styles.quizIconWrap}>
            <Feather name={quiz.icon} size={18} color="#B88700" />
          </View>
          <View style={styles.quizTextWrap}>
            <Text style={styles.quizTitle}>{quiz.title}</Text>
            <Text style={styles.quizMeta}>
              {quiz.questions} questions · {quiz.difficulty}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color="#A1A1AA" />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  quizColumn: {
    gap: 10,
  },
  quizCard: {
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
  quizIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,215,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizTextWrap: {
    flex: 1,
    gap: 2,
  },
  quizTitle: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '700',
  },
  quizMeta: {
    color: '#6B7280',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
