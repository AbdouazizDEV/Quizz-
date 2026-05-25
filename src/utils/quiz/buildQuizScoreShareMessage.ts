import type { QuizLeaderboardEntry } from '@app-types/quizPlay.types';

export interface QuizScoreShareInput {
  quizTitle: string;
  score: number;
  correctCount: number;
  total: number;
  leaderboard?: QuizLeaderboardEntry[];
}

const MEDAL = ['🥇', '🥈', '🥉'] as const;

function rankLabel(rank: number): string {
  if (rank === 1) return '1er';
  if (rank === 2) return '2e';
  return `${rank}e`;
}

export function buildQuizScoreShareMessage(input: QuizScoreShareInput): string {
  const { quizTitle, score, correctCount, total, leaderboard } = input;
  const lines: string[] = [
    `🎯 Quizz+ — ${quizTitle}`,
    `Score : ${score} pts (${correctCount}/${total} bonnes réponses)`,
  ];

  const me = leaderboard?.find((e) => e.isCurrentUser);
  if (me) {
    const medal = me.rank <= 3 ? MEDAL[me.rank - 1] : '';
    lines.push(`Classement : ${rankLabel(me.rank)} sur ce quiz ${medal}`.trim());
  }

  const top = leaderboard?.slice(0, 5);
  if (top?.length) {
    lines.push('', 'Top du quiz :');
    for (const row of top) {
      const medal = row.rank <= 3 ? MEDAL[row.rank - 1] : `${row.rank}.`;
      const suffix = row.isCurrentUser ? ' (moi)' : '';
      lines.push(`${medal} ${row.displayName}${suffix} — ${row.score} pts`);
    }
  }

  lines.push('', 'Rejoins-moi sur Quizz+ !');
  return lines.join('\n');
}
