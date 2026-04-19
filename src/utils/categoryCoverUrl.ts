/**
 * Visuels de couverture par slug (Unsplash) — la table `categories` n’a pas encore `cover_url`.
 * Déterministe pour le même slug partout (accueil, grille, détail).
 */
const SLUG_TO_COVER: Record<string, string> = {
  'culture-generale':
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
  sciences: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
  education: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
  games: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
  business: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
  entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  art: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80',
  plants: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e5a0?w=800&q=80',
  finance: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
  'food-drink': 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80',
  health: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  kids: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
  sports: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
  lifestyle: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
};

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80';

export function getCategoryCoverUrl(slug: string): string {
  const key = slug.trim().toLowerCase();
  return SLUG_TO_COVER[key] ?? DEFAULT_COVER;
}
