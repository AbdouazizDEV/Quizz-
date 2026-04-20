import type { LevelCode } from '@app-types/supabase/database.types';

const LEVEL_ORDER: LevelCode[] = ['Z0', 'Z1', 'Z2', 'Z3', 'A1', 'A2', 'A3'];
const SCORE_PER_LEVEL = 250;

const LEVEL_LABELS: Partial<Record<LevelCode, string>> = {
  Z0: '🌱 Niveau 1 · Débutant',
  Z1: '🌿 Niveau 2 · Curieux',
  Z2: '🎯 Niveau 3 · Confirmé',
  Z3: '⭐ Niveau 4 · Sérieux',
  A1: '🏅 Niveau 5 · Avancé',
  A2: '🔥 Niveau 6 · Expert',
  A3: '👑 Niveau 7 · Maître',
};

export function formatLevelCodeLabel(code: string | undefined): string {
  if (!code) return '🌱 Niveau · Débutant';
  return LEVEL_LABELS[code as LevelCode] ?? `Niveau ${code}`;
}

/** Niveau dérivé du score (palier de 250 points par niveau). */
export function levelCodeFromScore(totalScore: number): LevelCode {
  const safeScore = Number.isFinite(totalScore) ? Math.max(0, Math.floor(totalScore)) : 0;
  const idx = Math.floor(safeScore / SCORE_PER_LEVEL);
  return LEVEL_ORDER[Math.min(idx, LEVEL_ORDER.length - 1)]!;
}

/**
 * Progression visuelle intra-niveau (0–1), basée uniquement sur le score.
 * Exemple: 260 points => niveau 2 avec ~4% vers niveau 3.
 */
export function estimateLevelProgress(totalScore: number): number {
  const safeScore = Number.isFinite(totalScore) ? Math.max(0, Math.floor(totalScore)) : 0;
  const idx = Math.min(Math.floor(safeScore / SCORE_PER_LEVEL), LEVEL_ORDER.length - 1);
  if (idx >= LEVEL_ORDER.length - 1) return 1;
  const inLevel = safeScore % SCORE_PER_LEVEL;
  return Math.min(1, Math.max(0, inLevel / SCORE_PER_LEVEL));
}

/** Libellés courts sous la barre de progression (ex. Niv. 1 → Niv. 2). */
export function levelProgressEndpoints(totalScore: number): { left: string; right: string } {
  const safeScore = Number.isFinite(totalScore) ? Math.max(0, Math.floor(totalScore)) : 0;
  const idx = Math.min(Math.floor(safeScore / SCORE_PER_LEVEL), LEVEL_ORDER.length - 1);
  const left = `Niv. ${idx + 1}`;
  const right = idx < LEVEL_ORDER.length - 1 ? `Niv. ${idx + 2}` : 'Palier max';
  return { left, right };
}

/** Nombre de jours écoulés depuis une date, incrémenté toutes les 24h. */
export function elapsedDaysSince(dateIso: string | undefined, now = new Date()): number {
  if (!dateIso) return 0;
  const startedAt = new Date(dateIso);
  if (Number.isNaN(startedAt.getTime())) return 0;
  const diffMs = now.getTime() - startedAt.getTime();
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

export function firstNameFromDisplay(display: string): string {
  const t = display.trim();
  if (!t) return 'toi';
  return t.split(/\s+/)[0] ?? t;
}

/** Pluriel correct pour « jour ». */
export function formatJoursLabel(n: number): string {
  if (n <= 0) return '0 jour';
  if (n === 1) return '1 jour';
  return `${n} jours`;
}

export function initialsFromName(display: string): string {
  const t = display.trim();
  if (!t) return '?';
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}
