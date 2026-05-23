export const DefisRoutes = {
  hub: '/(tabs)/defis',
  challengeList: '/(tabs)/defis/challenge',
  challengeDetail: (id: string) => `/(tabs)/defis/challenge/${encodeURIComponent(id)}` as const,
  challengeLeaderboard: (id: string) =>
    `/(tabs)/defis/challenge/classement/${encodeURIComponent(id)}` as const,
  tournoiList: '/(tabs)/defis/tournoi',
  tournoiDetail: (id: string) => `/(tabs)/defis/tournoi/${encodeURIComponent(id)}` as const,
  tournoiBracket: (id: string) => `/(tabs)/defis/tournoi/bracket/${encodeURIComponent(id)}` as const,
  duelHub: '/(tabs)/defis/duel',
  duelDetail: (id: string) => `/(tabs)/defis/duel/${encodeURIComponent(id)}` as const,
  duelResult: (id: string) => `/(tabs)/defis/duel/resultat/${encodeURIComponent(id)}` as const,
} as const;
