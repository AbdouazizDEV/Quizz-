export const PREMIUM_PLANS = [
  { id: 'plan_1m' as const, label: '1 mois', price: '1 500 FCFA', hint: 'Les mêmes outils, un mois' },
  { id: 'plan_12m' as const, label: '12 mois', price: '15 000 FCFA', hint: 'Deux mois offerts et 3 gels de série' },
];

export const PREMIUM_BENEFITS = [
  { icon: 'book-open' as const, title: 'Carnet d’erreurs', body: 'Revois tes ratés, l’explication, et refais seulement ceux-là. Sans points.' },
  { icon: 'zap' as const, title: 'Entraînement', body: 'Replays sans plafond, une session Express en plus, un gel de série.' },
  { icon: 'award' as const, title: 'Identité', body: 'Badge Or du Sahel, cadres, thèmes et avatars d’Afrique de l’Ouest.' },
];

export const PREMIUM_COMPARE = [
  { label: 'Quiz, défis et Arena', free: true, premium: true },
  { label: 'Classement au même barème', free: true, premium: true },
  { label: 'Badges gagnés en jouant', free: true, premium: true },
  { label: '3 parties classées par jour', free: true, premium: false },
  { label: 'Replays classés sans plafond', free: false, premium: true },
  { label: 'Carnet d’erreurs et révision', free: false, premium: true },
  { label: 'Stats 30 jours par catégorie', free: false, premium: true },
  { label: 'Gel de série et objectif hebdo', free: false, premium: true },
  { label: 'Badge, cadres et thèmes Premium', free: false, premium: true },
];
