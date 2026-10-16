import type { HomeInsightItem } from '@components/ui/home/HomeInsightCarousel';
import type { HomeFunFact } from '@app-types/homeFunFacts.types';

const INSIGHT_GRADIENTS: readonly [string, string][] = [
  ['#EEF2FF', '#E0E7FF'],
  ['#FFF7D6', '#FFE9A8'],
  ['#E8FAF2', '#CCF1E2'],
];

export const FALLBACK_HOME_INSIGHTS: HomeInsightItem[] = [
  {
    id: 'fallback-1',
    body: 'Des sessions de quiz de 3 à 5 minutes améliorent la mémorisation à long terme.',
    tag: 'Neurosciences',
    gradient: INSIGHT_GRADIENTS[0]!,
  },
  {
    id: 'fallback-2',
    body: "Limiter le temps de réponse active l'attention et réduit la distraction.",
    tag: 'Productivité',
    gradient: INSIGHT_GRADIENTS[1]!,
  },
  {
    id: 'fallback-3',
    body: 'Rejouer un quiz 24 h puis 72 h plus tard ancre durablement les connaissances.',
    tag: 'Méthode',
    gradient: INSIGHT_GRADIENTS[2]!,
  },
];

export function mapFunFactsToInsights(facts: HomeFunFact[]): HomeInsightItem[] {
  return facts.map((fact, index) => ({
    id: fact.id,
    body: fact.body,
    tag: fact.tag,
    gradient: INSIGHT_GRADIENTS[index % INSIGHT_GRADIENTS.length]!,
  }));
}
