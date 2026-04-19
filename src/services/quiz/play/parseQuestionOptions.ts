import type { Json } from '@app-types/supabase/database.types';
import type { QuizPlayOption } from '@app-types/quizPlay.types';

export function parseQuestionOptions(raw: Json | unknown): QuizPlayOption[] {
  if (!Array.isArray(raw)) return [];
  const out: QuizPlayOption[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id : '';
    const label = typeof o.label === 'string' ? o.label : '';
    if (id && label) out.push({ id, label });
  }
  return out;
}
