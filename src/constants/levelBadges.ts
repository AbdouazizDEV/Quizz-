export const LEVEL_BADGES = [
  { code: 'Z0', step: 1, mark: 'I', tint: '#7DCEA0' },
  { code: 'Z1', step: 2, mark: 'II', tint: '#5DADE2' },
  { code: 'Z2', step: 3, mark: 'III', tint: '#F5B041' },
  { code: 'Z3', step: 4, mark: 'IV', tint: '#BB8FCE' },
  { code: 'A1', step: 5, mark: 'V', tint: '#E59866' },
  { code: 'A2', step: 6, mark: 'VI', tint: '#EC7063' },
  { code: 'A3', step: 7, mark: 'VII', tint: '#F4D03F' },
  { code: 'B1', step: 8, mark: 'VIII', tint: '#F5CBA7' },
  { code: 'B2', step: 9, mark: 'IX', tint: '#76D7C4' },
  { code: 'B3', step: 10, mark: 'X', tint: '#85C1E9' },
  { code: 'B4', step: 11, mark: 'XI', tint: '#F1948A' },
  { code: 'B5', step: 12, mark: 'XII', tint: '#D7BDE2' },
] as const;

export function levelBadgeFor(code: string | undefined) {
  return LEVEL_BADGES.find((item) => item.code === code) ?? LEVEL_BADGES[0];
}
