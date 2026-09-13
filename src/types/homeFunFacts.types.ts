export interface HomeFunFact {
  id: string;
  body: string;
  tag: string;
  quizId: string;
  quizTitle: string;
}

export interface HomeFunFactsPayload {
  date: string;
  items: HomeFunFact[];
}
