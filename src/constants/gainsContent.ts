import type {
  GainsCashPrize,
  GainsHowStep,
  GainsHistoryItem,
  GainsRewardCatalogItem,
  GainsStreakTier,
} from '@app-types/gains.types';

export const GAINS_STREAK_TIERS: GainsStreakTier[] = [
  {
    id: 's3',
    days: 3,
    bonusPoints: 50,
    label: '3 jours',
    hint: '+50 pts bonus',
  },
  {
    id: 's7',
    days: 7,
    bonusPoints: 150,
    label: '7 jours',
    hint: '+150 pts bonus',
  },
  {
    id: 's14',
    days: 14,
    bonusPoints: 300,
    label: '14 jours',
    hint: '+300 pts bonus',
  },
  {
    id: 's30',
    days: 30,
    bonusPoints: 500,
    label: '30 jours',
    hint: '+500 pts bonus',
  },
];

export const GAINS_CASH_PRIZES: GainsCashPrize[] = [
  {
    id: 'p1',
    periodLabel: '1ᵉʳ de la semaine',
    amountLabel: '25 000 FCFA',
    rankLabel: 'Top 1 hebdo',
  },
  {
    id: 'p2',
    periodLabel: '1ᵉʳ du mois',
    amountLabel: '100 000 FCFA',
    rankLabel: 'Top 1 mensuel',
  },
  {
    id: 'p3',
    periodLabel: '1ᵉʳ de l’année',
    amountLabel: '500 000 FCFA',
    rankLabel: 'Top 1 annuel',
  },
];

export const GAINS_REWARD_CATEGORIES = [
  'Bons d’achat',
  'Réductions',
  'Livres',
  'Accessoires',
  'Produits tech',
  'Services éducatifs',
] as const;

export const GAINS_REWARD_CATALOG: GainsRewardCatalogItem[] = [
  {
    id: 'r1',
    title: 'Bon d’achat 5 000 FCFA',
    costPoints: 800,
    category: 'Bons d’achat',
    available: true,
  },
  {
    id: 'r2',
    title: 'Réduction librairie -15 %',
    costPoints: 350,
    category: 'Réductions',
    available: true,
  },
  {
    id: 'r3',
    title: 'Ebook culture générale',
    costPoints: 220,
    category: 'Livres',
    available: true,
  },
  {
    id: 'r4',
    title: 'Casque Quizz+ (partenaire)',
    costPoints: 2_500,
    category: 'Accessoires',
    available: false,
  },
  {
    id: 'r5',
    title: 'Crédit data 2 Go',
    costPoints: 600,
    category: 'Produits tech',
    available: true,
  },
  {
    id: 'r6',
    title: 'Cours tutorat 1h',
    costPoints: 1_200,
    category: 'Services éducatifs',
    available: true,
  },
];

export const GAINS_PARTNER_OFFERS = [
  'Réduction accessoires partenaires',
  'Offre librairie partenaire',
  'Accès sponsorisé à un atelier',
] as const;

export const GAINS_HOW_STEPS: GainsHowStep[] = [
  {
    id: 'h1',
    icon: 'zap',
    title: 'Quiz Express',
    body: 'Enchaîne des parties courtes pour cumuler des points rapidement sans perdre le rythme.',
  },
  {
    id: 'h2',
    icon: 'flag',
    title: 'Défis & duels',
    body: 'Les défis hebdo et duels rapportent plus : vise les bonus de classement.',
  },
  {
    id: 'h3',
    icon: 'trending-up',
    title: 'Monte au classement',
    body: 'Chaque semaine repart : concentre-toi sur le Top 10 pour maximiser tes chances cash.',
  },
  {
    id: 'h4',
    icon: 'activity',
    title: 'Garde ta série',
    body: '3, 7, 14 puis 30 jours débloquent des bonus points automatiques.',
  },
];

export const GAINS_HISTORY_DEMO: GainsHistoryItem[] = [
  {
    id: 'hi1',
    title: 'Badge « Curieux du jour »',
    subtitle: 'Récompense de série',
    pointsDelta: 40,
    whenLabel: 'Hier',
  },
  {
    id: 'hi2',
    title: 'Challenge hebdo complété',
    subtitle: 'Bonus classement',
    pointsDelta: 120,
    whenLabel: 'Il y a 3 jours',
  },
  {
    id: 'hi3',
    title: 'Bon d’achat débloqué',
    subtitle: 'Échange de points',
    pointsDelta: -800,
    whenLabel: 'Il y a 1 semaine',
  },
];
