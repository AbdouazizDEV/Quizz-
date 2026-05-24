import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CountdownTimer } from '@components/atoms/CountdownTimer';
import { DefisPageShell } from '@components/ui/defis/DefisPageShell';
import { DefisSurfaceCard } from '@components/ui/defis/DefisSurfaceCard';
import { DefisRoutes } from '@constants/defisRoutes';
import { COLORS } from '@constants/Colors';
import { buildQuizEntryHref } from '@constants/Routes';
import { useChallenge } from '@hooks/defis/useChallenge';
import { useAuthMe } from '@hooks/useAuthMe';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import type { DailyQuiz } from '@app-types/challenge.types';
import {
  assertCanParticipateInChallengeQuiz,
  ChallengeParticipationError,
} from '@services/defis/participateChallenge.service';
import { useAppError } from '@providers/AppErrorProvider';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challengeId = typeof id === 'string' ? id : '';
  const router = useRouter();
  const { showAppError } = useAppError();
  const { data: authMe } = useAuthMe();
  const userId = authMe?.user?.id;
  const { isOnline } = useNetworkStatus();
  const { data, isLoading, isError, error } = useChallenge(challengeId, userId);

  const onStartQuiz = async (quiz: DailyQuiz) => {
    if (!userId || !challengeId) return;
    try {
      await assertCanParticipateInChallengeQuiz(
        userId,
        challengeId,
        quiz.quizId,
        quiz.scheduledDay,
      );
      router.push(buildQuizEntryHref(quiz.quizId, { challengeId }));
    } catch (error) {
      if (error instanceof ChallengeParticipationError) {
        showAppError(error.message, { title: 'Challenge' });
        return;
      }
      showAppError('Impossible de lancer ce quiz.', { title: 'Challenge' });
    }
  };

  return (
    <DefisPageShell title="Challenge">
      {isLoading && !data ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : isError ? (
        <Text style={styles.error}>
          {error instanceof Error ? error.message : 'Impossible de charger ce challenge.'}
        </Text>
      ) : data ? (
        <>
          {!isOnline ? (
            <Text style={styles.offlineHint}>
              Données en cache — reconnectez-vous pour actualiser.
            </Text>
          ) : null}
          <Text style={styles.title}>{data.challenge.title}</Text>
          <CountdownTimer endsAt={data.challenge.endsAt} />
          {data.challenge.rewardText ? (
            <Text style={styles.reward}>🎁 {data.challenge.rewardText}</Text>
          ) : null}

          <DefisSurfaceCard>
            {data.dailyQuizzes.map((quiz, index) => (
              <QuizDetailRow
                key={quiz.quizId}
                quiz={quiz}
                isLast={index === data.dailyQuizzes.length - 1}
                onStart={() => void onStartQuiz(quiz)}
              />
            ))}
          </DefisSurfaceCard>

          <Pressable
            style={styles.secondaryBtn}
            onPress={() => router.push(DefisRoutes.challengeLeaderboard(challengeId))}
          >
            <Text style={styles.secondaryBtnText}>Voir le classement</Text>
          </Pressable>
        </>
      ) : null}
    </DefisPageShell>
  );
}

function QuizDetailRow({
  quiz,
  isLast,
  onStart,
}: {
  quiz: DailyQuiz;
  isLast: boolean;
  onStart: () => void;
}) {
  const canPlay = quiz.isAvailable && !quiz.isPlayed;
  const scheduledLabel = new Date(`${quiz.scheduledDay}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <View style={[styles.quizBlock, !isLast && styles.quizBorder]}>
      <Text style={styles.quizTitle}>{quiz.title}</Text>
      <Text style={styles.quizMeta}>
        Difficulté {quiz.difficulty} · {quiz.maxScore / 3} questions
      </Text>

      {quiz.isPlayed ? (
        <>
          <Text style={styles.score}>Score : {quiz.userScore ?? 0} pts</Text>
          <Text style={styles.hint}>Quiz terminé — pas de rejouer dans ce challenge.</Text>
        </>
      ) : null}

      {!quiz.isAvailable ? (
        <>
          <Text style={styles.hint}>Disponible le {scheduledLabel}</Text>
          <Pressable style={[styles.primaryBtn, styles.primaryBtnDisabled]} disabled>
            <Text style={styles.primaryBtnText}>Disponible le {scheduledLabel}</Text>
          </Pressable>
        </>
      ) : null}

      {canPlay ? (
        <>
          <Text style={styles.warning}>
            ⚠️ Vous ne pouvez jouer ce quiz qu&apos;une seule fois dans ce challenge.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={onStart}>
            <Text style={styles.primaryBtnText}>Commencer le quiz</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 32 },
  error: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
  offlineHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  reward: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  quizBlock: { paddingVertical: 14, gap: 8 },
  quizBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  quizTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  quizMeta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  score: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: COLORS.primary,
  },
  hint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  warning: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.warning,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  primaryBtnText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textLight,
    fontSize: 14,
  },
  secondaryBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  secondaryBtnText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
