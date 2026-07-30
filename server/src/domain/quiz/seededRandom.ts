/**
 * RNG déterministe (mulberry32) — même seed ⇒ même séquence.
 * Utilisé pour composer des sets de questions reproductibles (tournoi).
 */
export function createSeededRandom(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Dérive un seed numérique stable depuis une chaîne (ex. tournament_id). */
export function seedFromString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffleWithSeed<T>(items: readonly T[], random: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = arr[i] as T;
    arr[i] = arr[j] as T;
    arr[j] = tmp;
  }
  return arr;
}

export function pickNWithSeed<T>(items: readonly T[], n: number, random: () => number): T[] {
  if (n <= 0) return [];
  if (n >= items.length) return shuffleWithSeed(items, random);
  return shuffleWithSeed(items, random).slice(0, n);
}
