# Backoffice API - Endpoints

Base URL: `http://localhost:3000/api/v1/backoffice`

## Authentification

- Header recommande:
  - `x-api-key: <BACKOFFICE_API_KEY>`
- En local (`NODE_ENV != production`), la cle peut etre bypass si non configuree.

---

## 1) Media

### `POST /media/upload-image`
- **Body (JSON)**:
```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "owner_id": "backoffice-test"
}
```
- **Reponse 201 (succes)**:
```json
{
  "ok": true,
  "secure_url": "https://res.cloudinary.com/.../quizzplus/covers/backoffice-test-1778258217204.png"
}
```
- **Reponse 400 (validation)**:
```json
{
  "ok": false,
  "error": "Payload invalide",
  "details": {
    "formErrors": [],
    "fieldErrors": {
      "image_base64": ["String must contain at least 40 character(s)"]
    }
  },
  "status": 400
}
```

---

## 2) Difficulty Levels

### `GET /levels`
- **Body**: aucun
- **Reponse 200**:
```json
{
  "ok": true,
  "items": [
    {
      "id": "uuid",
      "code": "Z0",
      "label": "Facile",
      "max_questions_per_quiz": 10,
      "sort_order": 1,
      "is_active": true
    }
  ]
}
```

### `POST /levels`
- **Body (JSON)**:
```json
{
  "code": "Z3",
  "label": "Expert",
  "description": "Niveau expert",
  "max_questions_per_quiz": 20,
  "sort_order": 4,
  "is_active": true
}
```
- **Reponse 201**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "code": "Z3",
    "label": "Expert"
  }
}
```

### `PUT /levels/:id`
- **Body (JSON)**:
```json
{
  "label": "Expert Plus",
  "max_questions_per_quiz": 25
}
```
- **Reponse 200**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "code": "Z3",
    "label": "Expert Plus"
  }
}
```

### `DELETE /levels/:id`
- **Body**: aucun
- **Reponse 200**:
```json
{ "ok": true }
```

---

## 3) Categories

### `GET /categories`
- **Body**: aucun
- **Reponse 200**:
```json
{
  "ok": true,
  "items": [
    { "id": "uuid", "name": "Culture Generale", "slug": "culture-generale" }
  ]
}
```

### `POST /categories`
- **Body (JSON)**:
```json
{
  "name": "Sciences",
  "slug": "sciences",
  "icon": "atom",
  "color": "#3366FF"
}
```
- **Reponse 201**:
```json
{
  "ok": true,
  "item": { "id": "uuid", "name": "Sciences", "slug": "sciences" }
}
```

### `PUT /categories/:id`
- **Body (JSON)**:
```json
{
  "name": "Sciences & Tech",
  "slug": "sciences-tech"
}
```
- **Reponse 200**:
```json
{
  "ok": true,
  "item": { "id": "uuid", "name": "Sciences & Tech", "slug": "sciences-tech" }
}
```

### `DELETE /categories/:id`
- **Body**: aucun
- **Reponse 200**:
```json
{ "ok": true }
```

---

## 4) Subcategories

### `GET /subcategories`
- **Query optionnelle**: `?category_id=<uuid>`
- **Body**: aucun
- **Reponse 200**:
```json
{
  "ok": true,
  "items": [
    { "id": "uuid", "category_id": "uuid", "name": "Physique", "slug": "physique" }
  ]
}
```

### `POST /subcategories`
- **Body (JSON)**:
```json
{
  "category_id": "uuid",
  "name": "Astronomie",
  "slug": "astronomie",
  "description": "Quiz astronomie"
}
```
- **Reponse 201**:
```json
{
  "ok": true,
  "item": { "id": "uuid", "category_id": "uuid", "name": "Astronomie", "slug": "astronomie" }
}
```

### `PUT /subcategories/:id`
- **Body (JSON)**:
```json
{
  "name": "Astrophysique",
  "slug": "astrophysique"
}
```
- **Reponse 200**:
```json
{
  "ok": true,
  "item": { "id": "uuid", "name": "Astrophysique", "slug": "astrophysique" }
}
```

### `DELETE /subcategories/:id`
- **Body**: aucun
- **Reponse 200**:
```json
{ "ok": true }
```

---

## 5) Quizzes

### `GET /quizzes`
- **Query supportees**: `page`, `limit`, `search`, `category_id`, `subcategory_id`, `difficulty_level`
- **Body**: aucun
- **Reponse 200**:
```json
{
  "ok": true,
  "items": [
    {
      "id": "uuid",
      "title": "Quiz Histoire",
      "difficulty_level": "Z1",
      "category_id": "uuid",
      "subcategory_id": "uuid"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1,
  "has_more": false
}
```

### `POST /quizzes`
- **Body (JSON)**:
```json
{
  "title": "Quiz Senegal",
  "description": "Culture generale",
  "category_id": "uuid",
  "subcategory_id": "uuid",
  "difficulty_level": "Z0",
  "theme": "geographie",
  "thumbnail_url": "https://example.com/cover.png",
  "points_per_question": 1,
  "completion_bonus": 10,
  "is_published": true
}
```
- **Reponse 201**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "title": "Quiz Senegal",
    "difficulty_level": "Z0",
    "total_questions": 0
  }
}
```

### `PUT /quizzes/:id`
- **Body (JSON)**:
```json
{
  "title": "Quiz Senegal - MAJ",
  "difficulty_level": "Z1"
}
```
- **Reponse 200**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "title": "Quiz Senegal - MAJ",
    "difficulty_level": "Z1"
  }
}
```

### `DELETE /quizzes/:id`
- **Body**: aucun
- **Reponse 200**:
```json
{ "ok": true }
```

### `POST /quizzes/import`
- **Body (multipart/form-data)**:
  - `file` (xlsx/csv) **obligatoire**
  - `title` **obligatoire**
  - `category_id` **obligatoire**
  - `subcategory_id` **obligatoire**
  - `difficulty_level` optionnel (`Z0`, `Z1`, `Z2`, `Z3`, ou `null`)
  - `theme` optionnel
- **Reponse 201**:
```json
{
  "ok": true,
  "quiz_ids": ["uuid-1", "uuid-2"],
  "imported_questions": 30
}
```

### `POST /quizzes/:quizId/import`
- **Body (multipart/form-data)**:
  - `file` (xlsx/csv) **obligatoire**
- **Reponse 201**:
```json
{
  "ok": true,
  "quiz_id": "uuid",
  "imported_questions": 10
}
```

---

## 6) Questions

### `GET /quizzes/:quizId/questions`
- **Body**: aucun
- **Reponse 200**:
```json
{
  "ok": true,
  "items": [
    {
      "id": "uuid",
      "quiz_id": "uuid",
      "question_text": "Quelle est la capitale du Senegal ?",
      "options": [
        { "id": "A", "label": "Dakar" },
        { "id": "B", "label": "Thies" }
      ],
      "correct_option_id": "A",
      "order_index": 1
    }
  ]
}
```

### `POST /questions`
- **Body (JSON)**:
```json
{
  "quiz_id": "uuid",
  "question_text": "Qui a fonde Dakar ?",
  "options": [
    { "id": "A", "label": "Option A" },
    { "id": "B", "label": "Option B" },
    { "id": "C", "label": "Option C" },
    { "id": "D", "label": "Option D" }
  ],
  "correct_option_id": "B",
  "explanation": "Explication courte",
  "order_index": 2,
  "subcategory": "Histoire",
  "tags": ["senegal", "histoire"],
  "difficulty_label": "Facile"
}
```
- **Reponse 201**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "quiz_id": "uuid",
    "question_text": "Qui a fonde Dakar ?"
  }
}
```

### `PUT /questions/:questionId`
- **Body (JSON)**:
```json
{
  "question_text": "Question modifiee ?",
  "correct_option_id": "C"
}
```
- **Reponse 200**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "question_text": "Question modifiee ?",
    "correct_option_id": "C"
  }
}
```

### `DELETE /questions/:questionId`
- **Body**: aucun
- **Reponse 200**:
```json
{ "ok": true }
```

---

## 7) Challenges (duels 1v1)

> **Note :** ces endpoints gèrent les **duels entre joueurs** (table `challenges`).
> Pour les **challenges hebdomadaires** mobile, utiliser la section **9) Weekly Challenges**.

### `GET /challenges`
- **Query supportees**: `page`, `limit`
- **Body**: aucun
- **Reponse 200**:
```json
{
  "ok": true,
  "items": [
    {
      "id": "uuid",
      "challenger_id": "uuid",
      "challenged_id": "uuid",
      "quiz_id": "uuid",
      "status": "pending"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

### `POST /challenges`
- **Body (JSON)**:
```json
{
  "challenger_id": "uuid",
  "challenged_id": "uuid",
  "quiz_id": "uuid",
  "status": "pending",
  "challenger_score": null,
  "challenged_score": null,
  "winner_id": null,
  "expires_at": "2026-12-31T23:59:59Z"
}
```
- **Reponse 201**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "status": "pending"
  }
}
```

### `PUT /challenges/:id`
- **Body (JSON)**:
```json
{
  "status": "completed",
  "challenger_score": 8,
  "challenged_score": 7,
  "winner_id": "uuid"
}
```
- **Reponse 200**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "status": "completed"
  }
}
```

### `DELETE /challenges/:id`
- **Body**: aucun
- **Reponse 200**:
```json
{ "ok": true }
```

---

## 8) Competitions

### `GET /competitions`
- **Query supportees**: `page`, `limit`
- **Body**: aucun
- **Reponse 200**:
```json
{
  "ok": true,
  "items": [
    {
      "id": "uuid",
      "title": "Competition mensuelle",
      "status": "live"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

### `POST /competitions`
- **Body (JSON)**:
```json
{
  "title": "Competition hebdo",
  "description": "Challenge de la semaine",
  "quiz_id": "uuid",
  "category_id": "uuid",
  "status": "scheduled",
  "starts_at": "2026-06-01T09:00:00Z",
  "ends_at": "2026-06-07T23:59:59Z",
  "reward_text": "Top 3 recompenses"
}
```
- **Reponse 201**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "title": "Competition hebdo",
    "status": "scheduled"
  }
}
```

### `PUT /competitions/:id`
- **Body (JSON)**:
```json
{
  "status": "live"
}
```
- **Reponse 200**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "status": "live"
  }
}
```

### `DELETE /competitions/:id`
- **Body**: aucun
- **Reponse 200**:
```json
{ "ok": true }
```

---

## 9) Weekly Challenges (hebdomadaires)

> **Note :** ces endpoints gèrent les **challenges hebdomadaires** mobile (tables `weekly_challenges` + `weekly_challenge_quizzes`).
> Ne pas confondre avec `/challenges` (duels 1v1).

### `GET /weekly-challenges`
- **Query supportees**: `page`, `limit`, `status=draft|actif|termine`
- **Body**: aucun
- **Reponse 200**:
```json
{
  "ok": true,
  "items": [
    {
      "id": "uuid",
      "title": "Challenge de la semaine",
      "type": "hebdomadaire",
      "status": "actif",
      "starts_at": "2026-06-01T00:00:00Z",
      "ends_at": "2026-06-07T23:59:59Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

### `GET /weekly-challenges/:id`
- **Body**: aucun
- **Reponse 200**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "title": "Challenge de la semaine",
    "description": "7 jours, 7 quiz",
    "type": "hebdomadaire",
    "status": "draft",
    "starts_at": "2026-06-01T00:00:00Z",
    "ends_at": "2026-06-07T23:59:59Z",
    "reward_text": "Meilleur score cumulé"
  }
}
```

### `POST /weekly-challenges`
- **Body (JSON)**:
```json
{
  "title": "Challenge de la semaine",
  "description": "7 jours, 7 quiz",
  "type": "hebdomadaire",
  "status": "draft",
  "starts_at": "2026-06-01T00:00:00Z",
  "ends_at": "2026-06-07T23:59:59Z",
  "reward_text": "Meilleur score cumulé"
}
```
- **Statuts** : `draft` | `actif` | `termine`
- **Reponse 201**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "title": "Challenge de la semaine",
    "status": "draft"
  }
}
```

### `PUT /weekly-challenges/:id`
- **Body (JSON)** (partiel) :
```json
{
  "status": "actif"
}
```
- **Reponse 200**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "status": "actif"
  }
}
```

### `DELETE /weekly-challenges/:id`
- **Body**: aucun
- **Reponse 200**:
```json
{ "ok": true }
```

### `GET /weekly-challenges/:id/quizzes`
- **Body**: aucun
- **Reponse 200**:
```json
{
  "ok": true,
  "items": [
    {
      "id": "uuid-link",
      "challenge_id": "uuid",
      "quiz_id": "uuid-quiz",
      "scheduled_day": "2026-06-01",
      "day_order": 1,
      "quizzes": {
        "id": "uuid-quiz",
        "title": "Quiz Culture G",
        "difficulty_level": "Z1",
        "is_published": true,
        "total_questions": 10
      }
    }
  ]
}
```

### `POST /weekly-challenges/:id/quizzes`
- **Body (JSON)**:
```json
{
  "quiz_id": "uuid-quiz",
  "scheduled_day": "2026-06-01",
  "day_order": 1
}
```
- **Reponse 201**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid-link",
    "challenge_id": "uuid",
    "quiz_id": "uuid-quiz",
    "scheduled_day": "2026-06-01",
    "day_order": 1
  }
}
```

### `PUT /weekly-challenges/:id/quizzes/:linkId`
- **Body (JSON)** (partiel) :
```json
{
  "scheduled_day": "2026-06-02",
  "day_order": 2
}
```
- **Reponse 200**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid-link",
    "scheduled_day": "2026-06-02",
    "day_order": 2
  }
}
```

### `DELETE /weekly-challenges/:id/quizzes/:linkId`
- **Body**: aucun
- **Reponse 200**:
```json
{ "ok": true }
```

---

## 10) Profiles (admin)

### `GET /profiles`
- **Query supportees**: `page`, `limit`, `search`, `is_suspended=true|false`
- **Body**: aucun
- **Reponse 200**:
```json
{
  "ok": true,
  "items": [
    {
      "id": "uuid",
      "username": "Mohamed",
      "full_name": "Mohamed",
      "is_suspended": true
    }
  ],
  "page": 1,
  "limit": 5,
  "total": 7
}
```

### `GET /profiles/:id`
- **Body**: aucun
- **Reponse 200**:
```json
{
  "ok": true,
  "profile": {
    "id": "uuid",
    "username": "Mohamed",
    "is_suspended": true
  },
  "auth": {
    "email": "user@example.com",
    "last_sign_in_at": "2026-05-01T20:51:31.039507Z"
  }
}
```

### `PATCH /profiles/:id/suspend`
- **Body (JSON)**:
```json
{
  "is_suspended": true,
  "suspended_until": "2026-12-31T23:59:59Z",
  "suspension_reason": "Violation des regles"
}
```
- **Reponse 200**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "is_suspended": true,
    "suspension_reason": "Violation des regles"
  }
}
```

---

## 11) Notifications

### `POST /notifications/send`
- **Body (JSON)**:
```json
{
  "user_id": "uuid",
  "type": "admin_notice",
  "title": "Test notification",
  "body": "Message de test backoffice",
  "data": {}
}
```
- **Reponse 201**:
```json
{
  "ok": true,
  "item": {
    "id": "uuid",
    "user_id": "uuid",
    "type": "admin_notice",
    "title": "Test notification",
    "body": "Message de test backoffice",
    "data": {},
    "is_read": false
  }
}
```

### `POST /notifications/broadcast`
- **Body (JSON)**:
```json
{
  "type": "admin_notice",
  "title": "Annonce globale",
  "body": "Diffusion test backoffice",
  "data": {}
}
```
- **Reponse 200**:
```json
{
  "ok": true,
  "inserted": 7
}
```

---

## Codes de reponse frequents

- `200`: OK
- `201`: Ressource creee
- `400`: Payload/parametres invalides
- `401`: API key invalide
- `404`: Ressource introuvable
- `500`: Erreur serveur / base de donnees
- `502`: Erreur service externe (Cloudinary)
- `503`: Configuration manquante (API key ou service role)
