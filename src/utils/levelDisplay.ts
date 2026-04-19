import type { LevelCode } from '@app-types/supabase/database.types';

const LEVEL_ORDER: LevelCode[] = ['Z0', 'Z1', 'Z2', 'Z3', 'A1', 'A2', 'A3'];

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

/** Progression visuelle entre deux niveaux (0–1), basée sur le code et l’activité. */
export function estimateLevelProgress(levelCode: string | undefined, quizzesCompleted: number): number {
  const idx = Math.max(0, LEVEL_ORDER.indexOf((levelCode ?? 'Z0') as LevelCode));
  const base = (idx + 1) / 8;
  const activity = Math.min(0.25, quizzesCompleted * 0.02);
  return Math.min(0.98, base * 0.85 + activity);
}

/** Libellés courts sous la barre de progression (ex. Niv. 1 → Niv. 2). */
export function levelProgressEndpoints(levelCode: string | undefined): { left: string; right: string } {
  const idx = Math.max(0, LEVEL_ORDER.indexOf((levelCode ?? 'Z0') as LevelCode));
  const left = `Niv. ${idx + 1}`;
  const right = idx < LEVEL_ORDER.length - 1 ? `Niv. ${idx + 2}` : 'Palier max';
  return { left, right };
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
