import { Alert } from 'react-native';

import type { IQuizScoreSharePort } from '@services/quiz/share/IQuizScoreSharePort';

export class AlertQuizScoreShareAdapter implements IQuizScoreSharePort {
  async shareScore(params: {
    quizTitle: string;
    score: number;
    correctCount: number;
    total: number;
  }): Promise<void> {
    Alert.alert(
      'Partage',
      `« ${params.quizTitle} » — ${params.correctCount}/${params.total} bonnes réponses, ${params.score} pts.\n\nLes notifications de partage seront branchées ici.`,
    );
  }
}
