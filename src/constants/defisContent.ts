import type { DefisParticipationItem, DefisSummaryItem } from '@app-types/defis.types';

export const DEFIS_SUMMARY_ITEMS: readonly DefisSummaryItem[] = [
  { id: 'active-challenge', label: '1 challenge actif', icon: 'flag' },
  { id: 'active-tournament', label: '1 tournoi en cours', icon: 'award' },
  { id: 'available-duel', label: '1 duel disponible', icon: 'zap' },
] as const;

export const DEFIS_WEEKLY_CHALLENGE = {
  eyebrow: 'Challenge de la semaine',
  title: 'Culture générale Sénégal',
  endsInLabel: 'Se termine dans 2 jours',
  rewardHint: 'Gagne des points pour le classement',
  ctaLabel: 'Participer',
} as const;

export const DEFIS_MONTHLY_TOURNAMENT = {
  eyebrow: 'Tournoi du mois',
  title: 'Tournoi Campus Dakar',
  statusLabel: 'En cours',
  formatHint: 'Format prestige',
  ctaLabel: 'Voir le tournoi',
} as const;

export const DEFIS_DUEL_SECTION = {
  title: 'Duel entre amis',
  description: 'Défie un ami sur un quiz rapide. Lance un duel simple.',
  ctaLabel: 'Créer un duel',
} as const;

export const DEFIS_REWARDS_SECTION = {
  title: 'Récompenses',
  description: "Gagne des points et monte au classement. Vise les récompenses cash de l'app.",
  ctaLabel: 'Voir classement',
} as const;

export const DEFIS_PARTICIPATIONS: readonly DefisParticipationItem[] = [
  {
    id: 'p1',
    title: 'Culture générale Sénégal',
    subtitle: 'Challenge · 240 pts gagnés',
    status: 'En cours',
  },
  {
    id: 'p2',
    title: 'Tournoi Campus Dakar',
    subtitle: 'Tournoi · Top 12',
    status: 'Actif',
  },
  {
    id: 'p3',
    title: 'Duel vs Awa',
    subtitle: 'Duel · Victoire',
    status: 'Terminé',
  },
] as const;
