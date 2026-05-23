import { useQuery } from '@tanstack/react-query';

import type { ChallengeProgress } from '@app-types/challenge.types';
import { fetchChallengeProgress } from '@services/defis/challengeRepository';

export function useChallenge(challengeId: string | undefined, userId: string | undefined) {
  return useQuery<ChallengeProgress>({
    queryKey: ['challenge', challengeId, userId],
    queryFn: () => {
      if (!challengeId || !userId) {
        throw new Error('Paramètres manquants');
      }
      return fetchChallengeProgress(challengeId, userId);
    },
    enabled: Boolean(challengeId && userId),
    staleTime: 1000 * 60,
  });
}
