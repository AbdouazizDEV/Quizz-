export const WEST_AFRICAN_BADGE_CODES = [
  'teranga',
  'griot',
  'kora',
  'baobab',
  'fleuve',
  'djembe',
  'masque',
  'soleil',
  'lion',
  'or-sahel',
] as const;

export type WestAfricanBadgeCode = (typeof WEST_AFRICAN_BADGE_CODES)[number];

export type PlayerBadgeView = {
  code: string;
  name: string;
  motif: string;
  how: string;
  earned: boolean;
  premiumOnly: boolean;
};

export type BadgeFinish = 'terracotta' | 'indigo' | 'gold';

export const BADGE_FINISH: Record<WestAfricanBadgeCode, BadgeFinish> = {
  teranga: 'terracotta',
  griot: 'indigo',
  kora: 'gold',
  baobab: 'terracotta',
  fleuve: 'indigo',
  djembe: 'terracotta',
  masque: 'indigo',
  soleil: 'gold',
  lion: 'terracotta',
  'or-sahel': 'gold',
};

export function isWestAfricanBadgeCode(code: string): code is WestAfricanBadgeCode {
  return (WEST_AFRICAN_BADGE_CODES as readonly string[]).includes(code);
}

export function pickFeaturedBadge(badges: PlayerBadgeView[]): PlayerBadgeView | null {
  const earned = badges.filter((badge) => badge.earned);
  return earned.find((badge) => badge.code === 'or-sahel') ?? earned.at(-1) ?? null;
}
