# Fondations Notifications & Quiz/Tournois (juillet 2026)

## Livré dans ce slice

### Domaine (SOLID — règles pures, sans I/O)
- `src/domain/quiz/difficultyPoints.ts` — `DIFFICULTY_POINTS` { easy:1, medium:2, hard:3 }
- `src/domain/quiz/buildQuizQuestionSet.ts` — warm-up easy + seed déterministe
- `src/domain/quiz/computeSessionScore.ts` — calcul score à partir des difficultés
- `src/domain/notifications/streakReminderPolicy.ts` — `STREAK_REMINDER_HOUR=18`, `STREAK_DEADLINE_HOUR=0`

### Quiz
- Play charge `questions.difficulty`
- Points par question via `pointsForDifficulty` (plus flat `points_per_question`)
- Composition warm-up via `buildQuizQuestionSet(seed=quizId)`
- Trigger SQL `recompute_quiz_session_score` (autorité serveur anti-triche)

### Tournois
- Migration `tournament_questions` + `competitions.seed` / `difficulty_mix`
- `materializeTournamentQuestions` à l’activation `live` (backoffice)

### Notifications
- Migration `user_devices`, `notification_log`, `notification_preferences`, `profiles.timezone`, `last_played_at`
- API : `POST /notifications/devices`, `GET|PUT /notifications/preferences`
- Streak phases `afternoon` / `final` (paramétrables)
- `registerExpoPushDevice` (no-op si `expo-notifications` absent)

## À faire côté ops / suite
1. Appliquer la migration Supabase `20260730160000_notifications_difficulty_tournaments.sql`
2. Installer push : `npx expo install expo-notifications`
3. Cron Edge Function horaire (sélection timezone locale 18h / deadline-1h) — squelette à ajouter
4. Triggers Postgres pour `notification_events` (ranking, duel, etc.)
5. Audit offline des écrans (Accueil / Jouer / Défis / Gains / Profil) avant finalisation hors-ligne
6. Brancher le play tournoi sur `tournament_questions` (écran « Jouer mon match »)
