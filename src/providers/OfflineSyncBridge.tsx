import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { loadAuthMe } from '@services/auth/authMeRepository';
import { onOfflineSyncComplete } from '@services/offline';

/** Invalide les caches React Query après synchronisation offline. */
export function OfflineSyncBridge() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return onOfflineSyncComplete(() => {
      void queryClient.invalidateQueries({ queryKey: ['competitions'] });
      void queryClient.invalidateQueries({ queryKey: ['competition'] });
      void queryClient.invalidateQueries({ queryKey: ['weekly-challenges'] });
      void queryClient.invalidateQueries({ queryKey: ['challenge'] });
      void queryClient.invalidateQueries({ queryKey: ['challenge-leaderboard'] });
      void queryClient.invalidateQueries({ queryKey: ['duels-pending'] });
      void queryClient.invalidateQueries({ queryKey: ['duels-recent'] });
      void queryClient.invalidateQueries({ queryKey: ['duels-pending-list'] });
      void queryClient.invalidateQueries({ queryKey: ['duels-recent-list'] });
      void queryClient.invalidateQueries({ queryKey: ['duel'] });
      void queryClient.invalidateQueries({ queryKey: ['profile-screen'] });
      // Après sync d’un POST /quizzes/:id/complete → score Accueil/profil à jour.
      void loadAuthMe({ force: true });
    });
  }, [queryClient]);

  return null;
}
