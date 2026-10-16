import type { HomeFunFact, HomeFunFactsPayload } from '@app-types/homeFunFacts.types';
import { apiClient } from '@services/api/apiClient';
import { extractApiError } from '@utils/extractApiError';

interface ApiHomeFunFact {
  id: string;
  body: string;
  tag: string;
  quiz_id: string;
  quiz_title: string;
}

interface ApiHomeFunFactsResponse {
  date: string;
  items: ApiHomeFunFact[];
}

function mapItem(row: ApiHomeFunFact): HomeFunFact {
  return {
    id: row.id,
    body: row.body,
    tag: row.tag,
    quizId: row.quiz_id,
    quizTitle: row.quiz_title,
  };
}

export async function fetchHomeFunFacts(): Promise<HomeFunFactsPayload> {
  try {
    const { data } = await apiClient.get<ApiHomeFunFactsResponse>('/home/fun-facts');
    return {
      date: data.date,
      items: (data.items ?? []).map(mapItem),
    };
  } catch (error) {
    throw new Error(extractApiError(error, 'Impossible de charger le savoir du jour.'));
  }
}
