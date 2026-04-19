  -- ════════════════════════════════════════════════════════════════════
  -- QUIZZ+ — SEED DE DÉMONSTRATION COMPLET
  -- Appliquer après les migrations :
  --   supabase db reset   OU coller dans le SQL Editor du dashboard Supabase
  -- ════════════════════════════════════════════════════════════════════

  -- ────────────────────────────────────────
  -- CATÉGORIES (14)
  -- ────────────────────────────────────────
  INSERT INTO categories (id, name, slug, icon, color)
  VALUES
    ('a1111111-1111-4111-8111-111111111101', 'Culture générale',  'culture-generale', 'book-open',  '#F5B200'),
    ('a1111111-1111-4111-8111-111111111102', 'Sciences',          'sciences',         'cpu',        '#4CAF50'),
    ('a1111111-1111-4111-8111-111111111103', 'Éducation',         'education',        'book',       '#F5B200'),
    ('a1111111-1111-4111-8111-111111111104', 'Jeux',              'games',            'cpu',        '#FFB703'),
    ('a1111111-1111-4111-8111-111111111105', 'Business',          'business',         'briefcase',  '#4CAF50'),
    ('a1111111-1111-4111-8111-111111111106', 'Divertissement',    'entertainment',    'music',      '#E91E63'),
    ('a1111111-1111-4111-8111-111111111107', 'Politique',         'politics',         'globe',      '#4CAF50'),
    ('a1111111-1111-4111-8111-111111111108', 'Sport',             'sports',           'football',   '#F5B200'),
    ('a1111111-1111-4111-8111-111111111109', 'Technologie',       'technology',       'cpu',        '#4CAF50'),
    ('a1111111-1111-4111-8111-111111111110', 'Vie quotidienne',   'daily-life',       'home',       '#FFB703'),
    ('a1111111-1111-4111-8111-111111111111', 'Géographie',        'geography',        'map',        '#E91E63'),
    ('a1111111-1111-4111-8111-111111111112', 'Histoire',          'history',          'book',       '#4CAF50'),
    ('a1111111-1111-4111-8111-111111111113', 'Arts',              'arts',             'palette',    '#F5B200'),
    ('a1111111-1111-4111-8111-111111111114', 'Musique',           'music',            'music',      '#4CAF50')
  ON CONFLICT (id) DO NOTHING;


  -- ════════════════════════════════════════════════════════════════════
  -- QUIZ (15 quiz répartis sur toutes les catégories et niveaux)
  -- ════════════════════════════════════════════════════════════════════
  INSERT INTO quizzes (id, title, description, category_id, difficulty_level, theme, total_questions, points_per_question, completion_bonus, play_count, is_published)
  VALUES
    -- Culture générale
    ('b2222222-2222-4222-8222-222222222201', 'Quiz du jour — Culture',      'Questions courtes pour valider le flux inscription + lecture des quiz.',   'a1111111-1111-4111-8111-111111111101', 'Z0', 'Quotidien',         10, 1, 10, 340, true),
    ('b2222222-2222-4222-8222-222222222202', 'Savoirs du monde',            'Testez vos connaissances générales sur le monde contemporain.',             'a1111111-1111-4111-8111-111111111101', 'Z1', 'Monde',             10, 1, 10, 210, true),

    -- Sciences
    ('b2222222-2222-4222-8222-222222222203', 'Sciences & Nature',           'Biologie, chimie et physique accessibles à tous.',                         'a1111111-1111-4111-8111-111111111102', 'Z0', 'Nature',            10, 1, 10, 185, true),
    ('b2222222-2222-4222-8222-222222222204', 'Le corps humain',             'Tout sur l anatomie et la physiologie humaine.',                           'a1111111-1111-4111-8111-111111111102', 'Z2', 'Santé',             10, 1, 10,  97, true),

    -- Histoire
    ('b2222222-2222-4222-8222-222222222205', 'Histoire de l''Afrique',      'Empires, royaumes et figures historiques du continent africain.',           'a1111111-1111-4111-8111-111111111112', 'Z1', 'Afrique',           10, 1, 10, 430, true),
    ('b2222222-2222-4222-8222-222222222206', 'Grandes civilisations',       'Égypte, Rome, Grèce, Mésopotamie — les piliers de l histoire mondiale.',   'a1111111-1111-4111-8111-111111111112', 'A1', 'Civilisations',     10, 1, 10, 162, true),

    -- Géographie
    ('b2222222-2222-4222-8222-222222222207', 'Capitales du monde',          'Identifiez les capitales de chaque pays.',                                 'a1111111-1111-4111-8111-111111111111', 'Z0', 'Capitales',         10, 1, 10, 510, true),
    ('b2222222-2222-4222-8222-222222222208', 'Afrique en détail',           'Fleuves, montagnes, pays et frontières du continent africain.',             'a1111111-1111-4111-8111-111111111111', 'Z2', 'Afrique',           10, 1, 10, 220, true),

    -- Sport
    ('b2222222-2222-4222-8222-222222222209', 'Football africain',           'CAN, clubs et stars du football sur le continent.',                        'a1111111-1111-4111-8111-111111111108', 'Z1', 'Football',          10, 1, 10, 670, true),
    ('b2222222-2222-4222-8222-222222222210', 'Sports olympiques',           'Histoire des Jeux Olympiques et records sportifs.',                        'a1111111-1111-4111-8111-111111111108', 'A1', 'Olympisme',         10, 1, 10, 145, true),

    -- Technologie
    ('b2222222-2222-4222-8222-222222222211', 'Tech & Numérique',            'Internet, smartphones, IA et révolution digitale.',                        'a1111111-1111-4111-8111-111111111109', 'Z1', 'Digital',           10, 1, 10, 303, true),

    -- Business
    ('b2222222-2222-4222-8222-222222222212', 'Entrepreneurs africains',     'Les visionnaires qui ont transformé l économie africaine.',                'a1111111-1111-4111-8111-111111111105', 'Z1', 'Entrepreneuriat',   10, 1, 10, 198, true),

    -- Musique
    ('b2222222-2222-4222-8222-222222222213', 'Musiques d''Afrique',         'Afrobeat, mbalax, makossa — les rythmes qui font vibrer le continent.',    'a1111111-1111-4111-8111-111111111114', 'Z0', 'Musique africaine', 10, 1, 10, 255, true),

    -- Arts
    ('b2222222-2222-4222-8222-222222222214', 'Art & Culture africaine',     'Masques, sculptures, peintures et artistes du continent.',                 'a1111111-1111-4111-8111-111111111113', 'Z2', 'Arts visuels',      10, 1, 10,  88, true),

    -- Vie quotidienne
    ('b2222222-2222-4222-8222-222222222215', 'La vie en ville',             'Questions pratiques sur la vie urbaine en Afrique de l Ouest.',            'a1111111-1111-4111-8111-111111111110', 'Z0', 'Urbain',            10, 1, 10, 141, true)
  ON CONFLICT (id) DO NOTHING;


  -- ════════════════════════════════════════════════════════════════════
  -- QUESTIONS
  -- ════════════════════════════════════════════════════════════════════

  -- ─────────────────────────────────────────
  -- QUIZ 01 — Culture générale / Z0 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('b2222222-2222-4222-8222-222222222202', 'b2222222-2222-4222-8222-222222222201', 'Quelle est la capitale du Sénégal ?',
    '[{"id":"A","label":"Dakar"},{"id":"B","label":"Thiès"},{"id":"C","label":"Saint-Louis"},{"id":"D","label":"Ziguinchor"}]'::jsonb,
    'A', 'Dakar est la capitale politique et économique du Sénégal.', 1),

    ('b2222222-2222-4222-8222-222222222203', 'b2222222-2222-4222-8222-222222222201', 'Combien de continents compte-t-on couramment ?',
    '[{"id":"A","label":"5"},{"id":"B","label":"6"},{"id":"C","label":"7"},{"id":"D","label":"8"}]'::jsonb,
    'C', 'Le modèle le plus répandu en géographie scolaire compte 7 continents.', 2),

    ('b2222222-2222-4222-8222-222222222204', 'b2222222-2222-4222-8222-222222222201', 'Quel gaz les plantes absorbent principalement pour la photosynthèse ?',
    '[{"id":"A","label":"Oxygène (O₂)"},{"id":"B","label":"Azote (N₂)"},{"id":"C","label":"CO₂"},{"id":"D","label":"Hydrogène (H₂)"}]'::jsonb,
    'C', 'Le CO₂ est fixé puis transformé en glucides grâce à la lumière.', 3),

    ('b2222222-2222-4222-8222-222222222205', 'b2222222-2222-4222-8222-222222222201', 'Quel est le plus grand océan du monde ?',
    '[{"id":"A","label":"Atlantique"},{"id":"B","label":"Pacifique"},{"id":"C","label":"Indien"},{"id":"D","label":"Arctique"}]'::jsonb,
    'B', 'L''Océan Pacifique couvre environ un tiers de la surface terrestre.', 4),

    ('b2222222-2222-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222201', 'Quel sport est roi au Sénégal ?',
    '[{"id":"A","label":"Football"},{"id":"B","label":"Basketball"},{"id":"C","label":"Tennis"},{"id":"D","label":"Lutte traditionnelle"}]'::jsonb,
    'D', 'La lutte traditionnelle sénégalaise (laamb) est le sport numéro 1 du pays.', 5),

    ('b2222222-2222-4222-8222-222222222207', 'b2222222-2222-4222-8222-222222222201', 'Combien y a-t-il de pays en Afrique ?',
    '[{"id":"A","label":"48"},{"id":"B","label":"52"},{"id":"C","label":"54"},{"id":"D","label":"56"}]'::jsonb,
    'C', 'L''Union africaine compte 54 États membres.', 6),

    ('b2222222-2222-4222-8222-222222222208', 'b2222222-2222-4222-8222-222222222201', 'Quelle est la monnaie officielle du Sénégal ?',
    '[{"id":"A","label":"Naira"},{"id":"B","label":"Franc CFA"},{"id":"C","label":"Shilling"},{"id":"D","label":"Cedi"}]'::jsonb,
    'B', 'Le Sénégal fait partie de la zone UEMOA qui utilise le franc CFA.', 7),

    ('b2222222-2222-4222-8222-222222222209', 'b2222222-2222-4222-8222-222222222201', 'Qui a inventé la téléphone ?',
    '[{"id":"A","label":"Thomas Edison"},{"id":"B","label":"Nikola Tesla"},{"id":"C","label":"Alexander Graham Bell"},{"id":"D","label":"Guglielmo Marconi"}]'::jsonb,
    'C', 'Alexander Graham Bell a déposé le premier brevet téléphonique en 1876.', 8),

    ('b2222222-2222-4222-8222-222222222210', 'b2222222-2222-4222-8222-222222222201', 'Quelle planète est surnommée la planète rouge ?',
    '[{"id":"A","label":"Vénus"},{"id":"B","label":"Jupiter"},{"id":"C","label":"Mars"},{"id":"D","label":"Mercure"}]'::jsonb,
    'C', 'Mars doit sa couleur rougeâtre à l''oxyde de fer présent sur sa surface.', 9),

    ('b2222222-2222-4222-8222-222222222211', 'b2222222-2222-4222-8222-222222222201', 'Quel est le plus long fleuve du monde ?',
    '[{"id":"A","label":"Amazone"},{"id":"B","label":"Congo"},{"id":"C","label":"Mississippi"},{"id":"D","label":"Nil"}]'::jsonb,
    'D', 'Le Nil, avec environ 6 650 km, est généralement reconnu comme le plus long fleuve du monde.', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 02 — Savoirs du monde / Z1 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('b2322222-2222-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222202', 'Quelle est la langue la plus parlée dans le monde ?',
    '[{"id":"A","label":"Anglais"},{"id":"B","label":"Mandarin"},{"id":"C","label":"Espagnol"},{"id":"D","label":"Hindi"}]'::jsonb,
    'B', 'Le mandarin est la langue avec le plus grand nombre de locuteurs natifs.', 1),

    ('b2222282-2222-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222202', 'Quel pays est le plus peuplé du monde ?',
    '[{"id":"A","label":"États-Unis"},{"id":"B","label":"Inde"},{"id":"C","label":"Chine"},{"id":"D","label":"Indonésie"}]'::jsonb,
    'B', 'L''Inde a dépassé la Chine en 2023 pour devenir le pays le plus peuplé.', 2),

    ('b2222222-2222-4022-8222-222222222206', 'b2222222-2222-4222-8222-222222222202', 'Quel est le plus grand pays du monde en superficie ?',
    '[{"id":"A","label":"Canada"},{"id":"B","label":"États-Unis"},{"id":"C","label":"Chine"},{"id":"D","label":"Russie"}]'::jsonb,
    'D', 'La Russie s''étend sur plus de 17 millions de km².', 3),

    ('b2222222-2222-4222-8222-222222222389', 'b2222222-2222-4222-8222-222222222202', 'Quelle organisation mondiale veille sur la santé ?',
    '[{"id":"A","label":"UNICEF"},{"id":"B","label":"OMS"},{"id":"C","label":"UNESCO"},{"id":"D","label":"FAO"}]'::jsonb,
    'B', 'L''Organisation Mondiale de la Santé (OMS) est l''agence spécialisée de l''ONU pour la santé.', 4),

    ('b2222222-2222-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222202', 'Quel est le symbole chimique de l''or ?',
    '[{"id":"A","label":"Or"},{"id":"B","label":"Go"},{"id":"C","label":"Au"},{"id":"D","label":"Ag"}]'::jsonb,
    'C', 'Au vient du latin "Aurum".', 5),

    ('c3333333-3333-4333-8333-333333333201', 'b2222222-2222-4222-8222-222222222202', 'En quelle année a été créé Internet (World Wide Web) ?',
    '[{"id":"A","label":"1983"},{"id":"B","label":"1989"},{"id":"C","label":"1993"},{"id":"D","label":"1999"}]'::jsonb,
    'B', 'Tim Berners-Lee a proposé le World Wide Web en 1989.', 6),

    ('c3333333-3333-4333-8333-333333333202', 'b2222222-2222-4222-8222-222222222202', 'Quel continent est appelé le berceau de l''humanité ?',
    '[{"id":"A","label":"Asie"},{"id":"B","label":"Europe"},{"id":"C","label":"Afrique"},{"id":"D","label":"Amérique du Sud"}]'::jsonb,
    'C', 'Les plus anciens fossiles d''Homo sapiens ont été retrouvés en Afrique.', 7),

    ('c3333333-3333-4333-8333-333333333203', 'b2222222-2222-4222-8222-222222222202', 'Combien de dents a un adulte humain ?',
    '[{"id":"A","label":"28"},{"id":"B","label":"30"},{"id":"C","label":"32"},{"id":"D","label":"36"}]'::jsonb,
    'C', 'Un adulte possède 32 dents, incluant les 4 dents de sagesse.', 8),

    ('c3333333-3333-4333-8333-333333333204', 'b2222222-2222-4222-8222-222222222202', 'Quel métal est le meilleur conducteur d''électricité ?',
    '[{"id":"A","label":"Fer"},{"id":"B","label":"Or"},{"id":"C","label":"Argent"},{"id":"D","label":"Cuivre"}]'::jsonb,
    'C', 'L''argent est le meilleur conducteur électrique, suivi du cuivre.', 9),

    ('c3333333-3333-4333-8333-333333333205', 'b2222222-2222-4222-8222-222222222202', 'Quelle est la vitesse de la lumière (approximativement) ?',
    '[{"id":"A","label":"150 000 km/s"},{"id":"B","label":"300 000 km/s"},{"id":"C","label":"450 000 km/s"},{"id":"D","label":"1 000 000 km/s"}]'::jsonb,
    'B', 'La lumière se déplace à environ 299 792 km/s dans le vide.', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 03 — Sciences & Nature / Z0 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('b2222221-1222-4222-8222-222222222203', 'b2222222-2222-4222-8222-222222222203', 'Quelle est la formule chimique de l''eau ?',
    '[{"id":"A","label":"H₂O₂"},{"id":"B","label":"HO"},{"id":"C","label":"H₂O"},{"id":"D","label":"H₃O"}]'::jsonb,
    'C', 'L''eau est composée de deux atomes d''hydrogène et d''un atome d''oxygène.', 1),

    ('b2222232-2222-4222-8222-222222222203', 'b2222222-2222-4222-8222-222222222203', 'Quel organe pompe le sang dans notre corps ?',
    '[{"id":"A","label":"Poumon"},{"id":"B","label":"Foie"},{"id":"C","label":"Rein"},{"id":"D","label":"Cœur"}]'::jsonb,
    'D', 'Le cœur est le muscle central du système cardiovasculaire.', 2),

    ('b2222232-2225-4222-8222-222222222203', 'b2222222-2222-4222-8222-222222222203', 'Combien d''os contient le corps humain adulte ?',
    '[{"id":"A","label":"106"},{"id":"B","label":"206"},{"id":"C","label":"306"},{"id":"D","label":"406"}]'::jsonb,
    'B', 'Le squelette humain adulte est composé de 206 os.', 3),

    ('c2222232-2225-4222-8222-222222222203', 'b2222222-2222-4222-8222-222222222203', 'Quel animal est le plus grand du monde ?',
    '[{"id":"A","label":"Éléphant d''Afrique"},{"id":"B","label":"Requin baleine"},{"id":"C","label":"Baleine bleue"},{"id":"D","label":"Girafe"}]'::jsonb,
    'C', 'La baleine bleue peut atteindre 30 mètres de long et 180 tonnes.', 4),

    ('c2222232-2225-4222-8222-232222222203', 'b2222222-2222-4222-8222-222222222203', 'Combien de pattes a une araignée ?',
    '[{"id":"A","label":"6"},{"id":"B","label":"8"},{"id":"C","label":"10"},{"id":"D","label":"12"}]'::jsonb,
    'B', 'Les araignées sont des arachnides et possèdent 8 pattes.', 5),

    ('c2229232-2225-4222-8222-232222222203', 'b2222222-2222-4222-8222-222222222203', 'Quelle planète est la plus proche du Soleil ?',
    '[{"id":"A","label":"Vénus"},{"id":"B","label":"Mars"},{"id":"C","label":"Mercure"},{"id":"D","label":"Terre"}]'::jsonb,
    'C', 'Mercure est la planète la plus proche du Soleil dans notre système solaire.', 6),

    ('c2229232-2025-4222-8222-232222222203', 'b2222222-2222-4222-8222-222222222203', 'Quelle est la substance la plus dure à l''état naturel ?',
    '[{"id":"A","label":"Granit"},{"id":"B","label":"Rubis"},{"id":"C","label":"Diamant"},{"id":"D","label":"Acier"}]'::jsonb,
    'C', 'Le diamant est le minéral naturel le plus dur, avec un indice de 10 sur l''échelle de Mohs.', 7),

    ('c2229232-2026-4222-8222-232222222203', 'b2222222-2222-4222-8222-222222222203', 'Quel gaz représente la plus grande part de l''atmosphère terrestre ?',
    '[{"id":"A","label":"Oxygène"},{"id":"B","label":"Azote"},{"id":"C","label":"CO₂"},{"id":"D","label":"Argon"}]'::jsonb,
    'B', 'L''azote (N₂) représente environ 78 % de l''atmosphère terrestre.', 8),

    ('c2229232-2027-4222-8222-232222222203', 'b2222222-2222-4222-8222-222222222203', 'Quel est l''élément le plus abondant dans l''univers ?',
    '[{"id":"A","label":"Hélium"},{"id":"B","label":"Oxygène"},{"id":"C","label":"Carbone"},{"id":"D","label":"Hydrogène"}]'::jsonb,
    'D', 'L''hydrogène représente environ 75 % de la masse baryonique de l''univers.', 9),

    ('c2229232-2028-4222-8222-232222222203', 'b2222222-2222-4222-8222-222222222203', 'À quelle température l''eau bout-elle au niveau de la mer ?',
    '[{"id":"A","label":"90 °C"},{"id":"B","label":"95 °C"},{"id":"C","label":"100 °C"},{"id":"D","label":"110 °C"}]'::jsonb,
    'C', 'Au niveau de la mer, la pression atmosphérique est de 1 atm et l''eau bout à 100 °C.', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 04 — Le corps humain / Z2 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('b2222232-1221-4222-8222-222222222204', 'b2222222-2222-4222-8222-222222222204', 'Quel est le plus grand organe du corps humain ?',
    '[{"id":"A","label":"Foie"},{"id":"B","label":"Cerveau"},{"id":"C","label":"Peau"},{"id":"D","label":"Intestin grêle"}]'::jsonb,
    'C', 'La peau est l''organe le plus étendu avec une superficie d''environ 1,5 à 2 m².', 1),

    ('b2222232-1222-4222-8222-222222222204', 'b2222222-2222-4222-8222-222222222204', 'Combien de litres de sang contient le corps humain adulte ?',
    '[{"id":"A","label":"2 à 3 litres"},{"id":"B","label":"4 à 5 litres"},{"id":"C","label":"7 à 8 litres"},{"id":"D","label":"10 à 12 litres"}]'::jsonb,
    'B', 'Un adulte moyen possède entre 4,5 et 5,5 litres de sang.', 2),

    ('b2222232-1223-4222-8222-222222222204', 'b2222222-2222-4222-8222-222222222204', 'Quel est le rôle principal du rein ?',
    '[{"id":"A","label":"Produire de l''insuline"},{"id":"B","label":"Filtrer le sang"},{"id":"C","label":"Digérer les graisses"},{"id":"D","label":"Réguler la température"}]'::jsonb,
    'B', 'Les reins filtrent le sang et éliminent les déchets via l''urine.', 3),

    ('b2222232-1224-4222-8222-222222222204', 'b2222222-2222-4222-8222-222222222204', 'Quel nerf est le plus long du corps humain ?',
    '[{"id":"A","label":"Nerf optique"},{"id":"B","label":"Nerf facial"},{"id":"C","label":"Nerf sciatique"},{"id":"D","label":"Nerf vague"}]'::jsonb,
    'C', 'Le nerf sciatique court de la colonne vertébrale jusqu''au pied.', 4),

    ('b2222232-1225-4222-8222-222222222204', 'b2222222-2222-4222-8222-222222222204', 'Où est produite la bile dans le corps ?',
    '[{"id":"A","label":"Pancréas"},{"id":"B","label":"Rate"},{"id":"C","label":"Foie"},{"id":"D","label":"Vésicule biliaire"}]'::jsonb,
    'C', 'La bile est produite par le foie et stockée dans la vésicule biliaire.', 5),

    ('b2222232-1226-4222-8222-222222222204', 'b2222222-2222-4222-8222-222222222204', 'Quelle est la durée approximative d''un cycle cardiaque au repos ?',
    '[{"id":"A","label":"0,4 secondes"},{"id":"B","label":"0,8 secondes"},{"id":"C","label":"1,5 secondes"},{"id":"D","label":"2 secondes"}]'::jsonb,
    'B', 'Au repos (60-80 bpm), un cycle cardiaque dure environ 0,8 secondes.', 6),

    ('b2222232-1227-4222-8222-222222222204', 'b2222222-2222-4222-8222-222222222204', 'Combien de vertèbres compte la colonne vertébrale humaine ?',
    '[{"id":"A","label":"24"},{"id":"B","label":"28"},{"id":"C","label":"33"},{"id":"D","label":"36"}]'::jsonb,
    'C', 'La colonne vertébrale compte 33 vertèbres réparties en 5 régions.', 7),

    ('b2222232-1228-4222-8222-222222222204', 'b2222222-2222-4222-8222-222222222204', 'Quel groupe sanguin est dit "donneur universel" ?',
    '[{"id":"A","label":"A+"},{"id":"B","label":"O-"},{"id":"C","label":"AB+"},{"id":"D","label":"B-"}]'::jsonb,
    'B', 'Le groupe O- peut être donné à tous les patients en urgence.', 8),

    ('b2222232-1229-4222-8222-222222222204', 'b2222222-2222-4222-8222-222222222204', 'Quelle glande produit l''insuline ?',
    '[{"id":"A","label":"Thyroïde"},{"id":"B","label":"Hypophyse"},{"id":"C","label":"Surrénale"},{"id":"D","label":"Pancréas"}]'::jsonb,
    'D', 'L''insuline est produite par les îlots de Langerhans du pancréas.', 9),

    ('b2222232-1230-4222-8222-222222222204', 'b2222222-2222-4222-8222-222222222204', 'Combien de muscles utilise-t-on pour sourire ?',
    '[{"id":"A","label":"5 à 7"},{"id":"B","label":"12 à 17"},{"id":"C","label":"25 à 30"},{"id":"D","label":"40 à 50"}]'::jsonb,
    'B', 'Un sourire mobilise en moyenne 12 à 17 muscles faciaux.', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 05 — Histoire de l''Afrique / Z1 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('b2222232-1231-4222-8222-222222222205', 'b2222222-2222-4222-8222-222222222205', 'Quel est le plus vieil empire d''Afrique de l''Ouest ?',
    '[{"id":"A","label":"Empire du Mali"},{"id":"B","label":"Empire Songhaï"},{"id":"C","label":"Empire du Ghana"},{"id":"D","label":"Empire du Bénin"}]'::jsonb,
    'C', 'L''Empire du Ghana (Ghana antique) est l''un des premiers grands empires de l''Afrique de l''Ouest, fondé vers le IVe siècle.', 1),

    ('b2222232-1232-4222-8222-222222222205', 'b2222222-2222-4222-8222-222222222205', 'Qui était Mansa Moussa ?',
    '[{"id":"A","label":"Roi du Bénin"},{"id":"B","label":"Pharaon égyptien"},{"id":"C","label":"Empereur du Mali"},{"id":"D","label":"Chef zoulou"}]'::jsonb,
    'C', 'Mansa Moussa (1280-1337) fut l''un des empereurs les plus riches de l''histoire, régnant sur l''Empire du Mali.', 2),

    ('b2222232-1233-4222-8222-222222222205', 'b2222222-2222-4222-8222-222222222205', 'En quelle année le Sénégal a-t-il obtenu son indépendance ?',
    '[{"id":"A","label":"1958"},{"id":"B","label":"1960"},{"id":"C","label":"1963"},{"id":"D","label":"1968"}]'::jsonb,
    'B', 'Le Sénégal a proclamé son indépendance le 4 avril 1960.', 3),

    ('b2222232-1234-4222-8222-222222222205', 'b2222222-2222-4222-8222-222222222205', 'Qui fut le premier président du Sénégal ?',
    '[{"id":"A","label":"Abdou Diouf"},{"id":"B","label":"Léopold Sédar Senghor"},{"id":"C","label":"Abdoulaye Wade"},{"id":"D","label":"Macky Sall"}]'::jsonb,
    'B', 'Léopold Sédar Senghor fut le premier président du Sénégal (1960-1980) et grand poète de la Négritude.', 4),

    ('b2222232-1235-4222-8222-222222222205', 'b2222222-2222-4222-8222-222222222205', 'Quel fleuve borde la frontière nord du Sénégal ?',
    '[{"id":"A","label":"Le Niger"},{"id":"B","label":"Le Congo"},{"id":"C","label":"Le Sénégal"},{"id":"D","label":"La Gambie"}]'::jsonb,
    'C', 'Le fleuve Sénégal forme la frontière naturelle entre le Sénégal et la Mauritanie.', 5),

    ('b2222232-1236-4222-8222-222222222205', 'b2222222-2222-4222-8222-222222222205', 'Quel est le nom de la guerre de résistance menée par Samori Touré ?',
    '[{"id":"A","label":"Guerre du Dahomey"},{"id":"B","label":"Résistance mandingue"},{"id":"C","label":"Guerre des Marabouts"},{"id":"D","label":"Résistance zouloue"}]'::jsonb,
    'B', 'Samori Touré dirigea la résistance mandingue contre la colonisation française de 1882 à 1898.', 6),

    ('b2222232-1237-4222-8222-222222222205', 'b2222222-2222-4222-8222-222222222205', 'Quelle est la plus ancienne université d''Afrique ?',
    '[{"id":"A","label":"Université du Caire"},{"id":"B","label":"Université de Tombouctou"},{"id":"C","label":"Université de Karueein (Fès)"},{"id":"D","label":"Université de Dakar"}]'::jsonb,
    'C', 'L''université de Karueein à Fès (Maroc), fondée en 859, est considérée comme la plus ancienne du monde.', 7),

    ('b2222232-1238-4222-8222-222222222205', 'b2222222-2222-4222-8222-222222222205', 'Quel peuple a construit les pyramides du Soudan (Méroé) ?',
    '[{"id":"A","label":"Les Égyptiens"},{"id":"B","label":"Les Nubiens (Kouchites)"},{"id":"C","label":"Les Éthiopiens"},{"id":"D","label":"Les Berbères"}]'::jsonb,
    'B', 'Les Nubiens du royaume de Méroé ont construit plus de 200 pyramides au Soudan actuel.', 8),

    ('b2222232-1239-4222-8222-222222222205', 'b2222222-2222-4222-8222-222222222205', 'La ville de Tombouctou était célèbre pour quoi au Moyen Âge ?',
    '[{"id":"A","label":"Son port fluvial"},{"id":"B","label":"Ses mines d''or"},{"id":"C","label":"Son savoir et ses universités"},{"id":"D","label":"Sa muraille"}]'::jsonb,
    'C', 'Tombouctou était un grand centre intellectuel et islamique avec la célèbre université Sankore.', 9),

    ('b2222232-1240-4222-8222-222222222205', 'b2222222-2222-4222-8222-222222222205', 'Quel pays africain n''a jamais été colonisé ?',
    '[{"id":"A","label":"Ghana"},{"id":"B","label":"Kenya"},{"id":"C","label":"Éthiopie"},{"id":"D","label":"Tanzanie"}]'::jsonb,
    'C', 'L''Éthiopie est le seul pays africain à n''avoir jamais été colonisé, ayant repoussé l''Italie à la bataille d''Adwa en 1896.', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 06 — Grandes civilisations / A1 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('b2222232-1241-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222206', 'En quelle année Rome a-t-elle été fondée selon la tradition ?',
    '[{"id":"A","label":"512 av. J.-C."},{"id":"B","label":"753 av. J.-C."},{"id":"C","label":"1000 av. J.-C."},{"id":"D","label":"300 av. J.-C."}]'::jsonb,
    'B', 'Selon la tradition, Rome fut fondée en 753 av. J.-C. par Romulus.', 1),

    ('b2222232-1242-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222206', 'Quel philosophe grec est considéré comme le père de la philosophie occidentale ?',
    '[{"id":"A","label":"Platon"},{"id":"B","label":"Aristote"},{"id":"C","label":"Socrate"},{"id":"D","label":"Épicure"}]'::jsonb,
    'C', 'Socrate (470-399 av. J.-C.) est souvent désigné comme le fondateur de la philosophie morale occidentale.', 2),

    ('b2222232-1243-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222206', 'Comment appelait-on l''écriture des anciens Égyptiens ?',
    '[{"id":"A","label":"Cunéiforme"},{"id":"B","label":"Hiéroglyphes"},{"id":"C","label":"Pictogrammes"},{"id":"D","label":"Runes"}]'::jsonb,
    'B', 'Les hiéroglyphes égyptiens sont l''un des plus anciens systèmes d''écriture du monde.', 3),

    ('b2222232-1244-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222206', 'Qui était Alexandre le Grand ?',
    '[{"id":"A","label":"Roi de Perse"},{"id":"B","label":"Pharaon d''Égypte"},{"id":"C","label":"Roi de Macédoine"},{"id":"D","label":"Consul romain"}]'::jsonb,
    'C', 'Alexandre III de Macédoine (356-323 av. J.-C.) a créé l''un des plus grands empires de l''Antiquité.', 4),

    ('b2222232-1245-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222206', 'Quel fleuve a vu naître la civilisation mésopotamienne ?',
    '[{"id":"A","label":"Nil"},{"id":"B","label":"Jourdain"},{"id":"C","label":"Indus"},{"id":"D","label":"Tigre et Euphrate"}]'::jsonb,
    'D', 'La Mésopotamie, berceau de la civilisation, s''est développée entre le Tigre et l''Euphrate.', 5),

    ('b2222232-1246-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222206', 'Quel est le nom du plus célèbre code de lois babylonien ?',
    '[{"id":"A","label":"Code de Dracon"},{"id":"B","label":"Loi des XII Tables"},{"id":"C","label":"Code d''Hammurabi"},{"id":"D","label":"Édit de Cyrus"}]'::jsonb,
    'C', 'Le Code d''Hammurabi (~1754 av. J.-C.) est l''un des plus anciens textes juridiques connus.', 6),

    ('b2222232-1247-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222206', 'Où se trouvaient les Jardins suspendus de Babylone ?',
    '[{"id":"A","label":"Iran actuel"},{"id":"B","label":"Irak actuel"},{"id":"C","label":"Turquie actuelle"},{"id":"D","label":"Syrie actuelle"}]'::jsonb,
    'B', 'Babylone se trouvait dans ce qui est aujourd''hui l''Irak, près de Bagdad.', 7),

    ('b2222232-1248-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222206', 'Quel peuple a inventé la roue ?',
    '[{"id":"A","label":"Les Égyptiens"},{"id":"B","label":"Les Grecs"},{"id":"C","label":"Les Sumériens"},{"id":"D","label":"Les Chinois"}]'::jsonb,
    'C', 'La roue aurait été inventée par les Sumériens vers 3500 av. J.-C. en Mésopotamie.', 8),

    ('b2222232-1249-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222206', 'Quelle est la longueur approximative de la Grande Muraille de Chine ?',
    '[{"id":"A","label":"2 000 km"},{"id":"B","label":"5 000 km"},{"id":"C","label":"21 000 km"},{"id":"D","label":"40 000 km"}]'::jsonb,
    'C', 'La Grande Muraille mesure environ 21 196 km en incluant toutes ses sections et ramifications.', 9),

    ('b2222232-1250-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222206', 'Qui était Cléopâtre VII ?',
    '[{"id":"A","label":"Reine de Rome"},{"id":"B","label":"Dernière reine ptolémaïque d''Égypte"},{"id":"C","label":"Reine de Nubie"},{"id":"D","label":"Impératrice de Perse"}]'::jsonb,
    'B', 'Cléopâtre VII (69-30 av. J.-C.) fut la dernière souveraine de la dynastie ptolémaïque d''Égypte.', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 07 — Capitales du monde / Z0 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('c3333333-3333-4333-8333-333333333701', 'b2222222-2222-4222-8222-222222222207', 'Quelle est la capitale de la France ?',
    '[{"id":"A","label":"Lyon"},{"id":"B","label":"Marseille"},{"id":"C","label":"Paris"},{"id":"D","label":"Bordeaux"}]'::jsonb,
    'C', 'Paris est la capitale et la plus grande ville de France.', 1),

    ('c3333333-3333-4333-8333-333333333702', 'b2222222-2222-4222-8222-222222222207', 'Quelle est la capitale du Maroc ?',
    '[{"id":"A","label":"Casablanca"},{"id":"B","label":"Marrakech"},{"id":"C","label":"Fès"},{"id":"D","label":"Rabat"}]'::jsonb,
    'D', 'Rabat est la capitale administrative du Maroc, bien que Casablanca soit plus grande.', 2),

    ('c3333333-3333-4333-8333-333333333703', 'b2222222-2222-4222-8222-222222222207', 'Quelle est la capitale du Nigeria ?',
    '[{"id":"A","label":"Lagos"},{"id":"B","label":"Abuja"},{"id":"C","label":"Kano"},{"id":"D","label":"Ibadan"}]'::jsonb,
    'B', 'Abuja est la capitale fédérale du Nigeria depuis 1991, remplaçant Lagos.', 3),

    ('c3333333-3333-4333-8333-333333333704', 'b2222222-2222-4222-8222-222222222207', 'Quelle est la capitale du Brésil ?',
    '[{"id":"A","label":"Rio de Janeiro"},{"id":"B","label":"São Paulo"},{"id":"C","label":"Brasilia"},{"id":"D","label":"Salvador"}]'::jsonb,
    'C', 'Brasilia est la capitale du Brésil depuis 1960, construite de toutes pièces en moins de 4 ans.', 4),

    ('c3333333-3333-4333-8333-333333333705', 'b2222222-2222-4222-8222-222222222207', 'Quelle est la capitale de l''Australie ?',
    '[{"id":"A","label":"Sydney"},{"id":"B","label":"Melbourne"},{"id":"C","label":"Brisbane"},{"id":"D","label":"Canberra"}]'::jsonb,
    'D', 'Canberra est la capitale de l''Australie, choisie comme compromis entre Sydney et Melbourne.', 5),

    ('c3333333-3333-4333-8333-333333333706', 'b2222222-2222-4222-8222-222222222207', 'Quelle est la capitale de la Côte d''Ivoire ?',
    '[{"id":"A","label":"Abidjan"},{"id":"B","label":"Yamoussoukro"},{"id":"C","label":"Bouaké"},{"id":"D","label":"San Pédro"}]'::jsonb,
    'B', 'Yamoussoukro est la capitale politique officielle, bien qu''Abidjan reste le centre économique.', 6),

    ('c3333333-3333-4333-8333-333333333707', 'b2222222-2222-4222-8222-222222222207', 'Quelle est la capitale du Canada ?',
    '[{"id":"A","label":"Toronto"},{"id":"B","label":"Montréal"},{"id":"C","label":"Vancouver"},{"id":"D","label":"Ottawa"}]'::jsonb,
    'D', 'Ottawa est la capitale fédérale du Canada depuis 1857.', 7),

    ('c3333333-3333-4333-8333-333333333708', 'b2222222-2222-4222-8222-222222222207', 'Quelle est la capitale de la Chine ?',
    '[{"id":"A","label":"Shanghai"},{"id":"B","label":"Hong Kong"},{"id":"C","label":"Pékin"},{"id":"D","label":"Nankin"}]'::jsonb,
    'C', 'Pékin (Beijing) est la capitale de la République populaire de Chine.', 8),

    ('c3333333-3333-4333-8333-333333333709', 'b2222222-2222-4222-8222-222222222207', 'Quelle est la capitale du Ghana ?',
    '[{"id":"A","label":"Kumasi"},{"id":"B","label":"Accra"},{"id":"C","label":"Tamale"},{"id":"D","label":"Cape Coast"}]'::jsonb,
    'B', 'Accra est la capitale et la plus grande ville du Ghana.', 9),

    ('c3333333-3333-4333-8333-333333333710', 'b2222222-2222-4222-8222-222222222207', 'Quelle est la capitale de l''Arabie Saoudite ?',
    '[{"id":"A","label":"Djeddah"},{"id":"B","label":"La Mecque"},{"id":"C","label":"Riyad"},{"id":"D","label":"Médine"}]'::jsonb,
    'C', 'Riyad est la capitale politique et administrative de l''Arabie Saoudite.', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 08 — Afrique en détail / Z2 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('c3333333-3333-4333-8333-333333333801', 'b2222222-2222-4222-8222-222222222208', 'Quel est le plus grand pays d''Afrique ?',
    '[{"id":"A","label":"Soudan"},{"id":"B","label":"Algérie"},{"id":"C","label":"Congo (RDC)"},{"id":"D","label":"Libye"}]'::jsonb,
    'B', 'L''Algérie est le plus grand pays d''Afrique avec 2,38 millions de km².', 1),

    ('c3333333-3333-4333-8333-333333333802', 'b2222222-2222-4222-8222-222222222208', 'Quel est le plus long fleuve d''Afrique ?',
    '[{"id":"A","label":"Congo"},{"id":"B","label":"Niger"},{"id":"C","label":"Nil"},{"id":"D","label":"Zambèze"}]'::jsonb,
    'C', 'Le Nil, avec environ 6 650 km, est le plus long fleuve d''Afrique.', 2),

    ('c3333333-3333-4333-8333-333333333803', 'b2222222-2222-4222-8222-222222222208', 'Quel est le plus haut sommet d''Afrique ?',
    '[{"id":"A","label":"Mont Kenya"},{"id":"B","label":"Kilimandjaro"},{"id":"C","label":"Mont Cameroun"},{"id":"D","label":"Ras Dashen"}]'::jsonb,
    'B', 'Le Kilimandjaro en Tanzanie culmine à 5 895 m, c''est le plus haut sommet d''Afrique.', 3),

    ('c3333333-3333-4333-8333-333333333804', 'b2222222-2222-4222-8222-222222222208', 'Quel est le plus grand désert d''Afrique ?',
    '[{"id":"A","label":"Désert du Namib"},{"id":"B","label":"Désert du Kalahari"},{"id":"C","label":"Désert du Sahara"},{"id":"D","label":"Désert de Libye"}]'::jsonb,
    'C', 'Le Sahara couvre environ 9,2 millions de km², soit 31 % du continent africain.', 4),

    ('c3333333-3333-4333-8333-333333333805', 'b2222222-2222-4222-8222-222222222208', 'Quel lac est le plus grand d''Afrique ?',
    '[{"id":"A","label":"Lac Victoria"},{"id":"B","label":"Lac Tanganyika"},{"id":"C","label":"Lac Malawi"},{"id":"D","label":"Lac Tchad"}]'::jsonb,
    'A', 'Le lac Victoria est le plus grand lac d''Afrique et le deuxième plus grand lac d''eau douce du monde.', 5),

    ('c3333333-3333-4333-8333-333333333806', 'b2222222-2222-4222-8222-222222222208', 'Quel pays partage une frontière avec le plus grand nombre de pays africains ?',
    '[{"id":"A","label":"Soudan"},{"id":"B","label":"Congo (RDC)"},{"id":"C","label":"Niger"},{"id":"D","label":"Éthiopie"}]'::jsonb,
    'B', 'La RDC partage ses frontières avec 9 pays africains.', 6),

    ('c3333333-3333-4333-8333-333333333807', 'b2222222-2222-4222-8222-222222222208', 'Lequel de ces pays est enclavé (sans accès à la mer) ?',
    '[{"id":"A","label":"Mozambique"},{"id":"B","label":"Burkina Faso"},{"id":"C","label":"Sénégal"},{"id":"D","label":"Cameroun"}]'::jsonb,
    'B', 'Le Burkina Faso est un pays enclavé d''Afrique de l''Ouest, sans façade maritime.', 7),

    ('c3333333-3333-4333-8333-333333333808', 'b2222222-2222-4222-8222-222222222208', 'Quelle ville est la plus peuplée d''Afrique ?',
    '[{"id":"A","label":"Cairo"},{"id":"B","label":"Lagos"},{"id":"C","label":"Kinshasa"},{"id":"D","label":"Johannesburg"}]'::jsonb,
    'B', 'Lagos au Nigeria, avec plus de 20 millions d''habitants, est la ville la plus peuplée d''Afrique.', 8),

    ('c3333333-3333-4333-8333-333333333809', 'b2222222-2222-4222-8222-222222222208', 'Quel détroit sépare l''Afrique de l''Europe ?',
    '[{"id":"A","label":"Détroit de Malacca"},{"id":"B","label":"Détroit de Bab-el-Mandeb"},{"id":"C","label":"Détroit de Gibraltar"},{"id":"D","label":"Canal de Suez"}]'::jsonb,
    'C', 'Le détroit de Gibraltar, large d''environ 14 km, sépare l''Espagne du Maroc.', 9),

    ('c3333333-3333-4333-8333-333333333810', 'b2222222-2222-4222-8222-222222222208', 'Quel pays africain a la plus grande économie ?',
    '[{"id":"A","label":"Afrique du Sud"},{"id":"B","label":"Éthiopie"},{"id":"C","label":"Égypte"},{"id":"D","label":"Nigeria"}]'::jsonb,
    'D', 'Le Nigeria possède le PIB le plus élevé d''Afrique (environ 450 milliards USD).', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 09 — Football africain / Z1 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('c3333333-3333-4333-8333-333333333901', 'b2222222-2222-4222-8222-222222222209', 'Quel pays a remporté la CAN 2022 ?',
    '[{"id":"A","label":"Sénégal"},{"id":"B","label":"Égypte"},{"id":"C","label":"Maroc"},{"id":"D","label":"Cameroun"}]'::jsonb,
    'A', 'Le Sénégal a remporté sa première CAN en 2022 (Cameroun) en battant l''Égypte en finale aux tirs au but.', 1),

    ('c3333333-3333-4333-8333-333333333902', 'b2222222-2222-4222-8222-222222222209', 'Qui est le meilleur buteur de l''histoire de la CAN ?',
    '[{"id":"A","label":"Samuel Eto''o"},{"id":"B","label":"Didier Drogba"},{"id":"C","label":"Hossam Hassan"},{"id":"D","label":"Sadio Mané"}]'::jsonb,
    'C', 'L''Égyptien Hossam Hassan détient le record avec 18 buts en CAN.', 2),

    ('c3333333-3333-4333-8333-333333333903', 'b2222222-2222-4222-8222-222222222209', 'Dans quel pays la CAN 2025 sera-t-elle organisée ?',
    '[{"id":"A","label":"Maroc"},{"id":"B","label":"Guinée"},{"id":"C","label":"Sénégal"},{"id":"D","label":"Afrique du Sud"}]'::jsonb,
    'A', 'Le Maroc organisera la CAN 2025 (édition initialement prévue pour 2025).', 3),

    ('c3333333-3333-4333-8333-333333333904', 'b2222222-2222-4222-8222-222222222209', 'Quel club africain est le plus titré en Ligue des Champions de la CAF ?',
    '[{"id":"A","label":"ES Tunis"},{"id":"B","label":"Al-Ahly (Égypte)"},{"id":"C","label":"TP Mazembe"},{"id":"D","label":"Wydad (Maroc)"}]'::jsonb,
    'B', 'Al-Ahly est le club le plus titré en Ligue des Champions de la CAF avec plus de 10 titres.', 4),

    ('c3333333-3333-4333-8333-333333333905', 'b2222222-2222-4222-8222-222222222209', 'Quelle est la sélection africaine surnommée "Les Lions de l''Atlas" ?',
    '[{"id":"A","label":"Sénégal"},{"id":"B","label":"Égypte"},{"id":"C","label":"Maroc"},{"id":"D","label":"Algérie"}]'::jsonb,
    'C', 'L''équipe nationale du Maroc est surnommée "Les Lions de l''Atlas".', 5),

    ('c3333333-3333-4333-8333-333333333906', 'b2222222-2222-4222-8222-222222222209', 'Lors de quelle Coupe du Monde une équipe africaine a-t-elle atteint les demi-finales pour la première fois ?',
    '[{"id":"A","label":"1990 (Cameroun)"},{"id":"B","label":"2010 (Ghana)"},{"id":"C","label":"2002 (Sénégal)"},{"id":"D","label":"2022 (Maroc)"}]'::jsonb,
    'D', 'Le Maroc a réalisé l''exploit historique d''atteindre les demi-finales du Mondial 2022 au Qatar.', 6),

    ('c3333333-3333-4333-8333-333333333907', 'b2222222-2222-4222-8222-222222222209', 'Quel Sénégalais a remporté le Ballon d''Or africain plusieurs fois ?',
    '[{"id":"A","label":"El Hadji Diouf"},{"id":"B","label":"Sadio Mané"},{"id":"C","label":"Papiss Cissé"},{"id":"D","label":"Henri Camara"}]'::jsonb,
    'B', 'Sadio Mané a remporté le Ballon d''Or africain en 2019 et 2022.', 7),

    ('c3333333-3333-4333-8333-333333333908', 'b2222222-2222-4222-8222-222222222209', 'Quel stade est le plus grand d''Afrique ?',
    '[{"id":"A","label":"Stade FNB (Johannesburg)"},{"id":"B","label":"Stade du Caire"},{"id":"C","label":"Stade Abdoulaye Wade (Diamniadio)"},{"id":"D","label":"Stade de Casablanca"}]'::jsonb,
    'C', 'Le stade Abdoulaye Wade de Diamniadio (Sénégal) peut accueillir 50 000 spectateurs.', 8),

    ('c3333333-3333-4333-8333-333333333909', 'b2222222-2222-4222-8222-222222222209', 'Quel pays a accueilli la première Coupe du Monde en Afrique ?',
    '[{"id":"A","label":"Égypte"},{"id":"B","label":"Nigeria"},{"id":"C","label":"Afrique du Sud"},{"id":"D","label":"Maroc"}]'::jsonb,
    'C', 'L''Afrique du Sud a accueilli la Coupe du Monde 2010, première sur le continent africain.', 9),

    ('c3333333-3333-4333-8333-333333333910', 'b2222222-2222-4222-8222-222222222209', 'Quel joueur africain a remporté la Premier League le plus de fois ?',
    '[{"id":"A","label":"Didier Drogba"},{"id":"B","label":"Mo Salah"},{"id":"C","label":"Yaya Touré"},{"id":"D","label":"Nwankwo Kanu"}]'::jsonb,
    'A', 'Didier Drogba a remporté la Premier League 4 fois avec Chelsea (2005, 2006, 2010, 2015).', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 10 — Sports olympiques / A1 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('c3333333-3333-4333-8333-333333334001', 'b2222222-2222-4222-8222-222222222210', 'En quelle année ont eu lieu les premiers Jeux Olympiques modernes ?',
    '[{"id":"A","label":"1888"},{"id":"B","label":"1896"},{"id":"C","label":"1900"},{"id":"D","label":"1912"}]'::jsonb,
    'B', 'Les premiers Jeux Olympiques modernes ont eu lieu à Athènes en 1896.', 1),

    ('c3333333-3333-4333-8333-333333334002', 'b2222222-2222-4222-8222-222222222210', 'Quel athlète a remporté 9 médailles d''or aux JO de sprint ?',
    '[{"id":"A","label":"Carl Lewis"},{"id":"B","label":"Michael Johnson"},{"id":"C","label":"Usain Bolt"},{"id":"D","label":"Maurice Greene"}]'::jsonb,
    'C', 'Usain Bolt a remporté 9 médailles d''or aux JO (2008, 2012, 2016) sur 100m, 200m et 4x100m.', 2),

    ('c3333333-3333-4333-8333-333333334003', 'b2222222-2222-4222-8222-222222222210', 'Combien d''anneaux compte le symbole olympique ?',
    '[{"id":"A","label":"4"},{"id":"B","label":"5"},{"id":"C","label":"6"},{"id":"D","label":"7"}]'::jsonb,
    'B', 'Le drapeau olympique comprend 5 anneaux colorés représentant les 5 continents.', 3),

    ('c3333333-3333-4333-8333-333333334004', 'b2222222-2222-4222-8222-222222222210', 'Quel pays a remporté le plus de médailles dans l''histoire des JO ?',
    '[{"id":"A","label":"Russie"},{"id":"B","label":"Chine"},{"id":"C","label":"États-Unis"},{"id":"D","label":"Allemagne"}]'::jsonb,
    'C', 'Les États-Unis dominent le classement all-time avec plus de 2 600 médailles olympiques.', 4),

    ('c3333333-3333-4333-8333-333333334005', 'b2222222-2222-4222-8222-222222222210', 'Quelle ville africaine a accueilli les Jeux Olympiques ?',
    '[{"id":"A","label":"Dakar"},{"id":"B","label":"Nairobi"},{"id":"C","label":"Aucune jusqu''en 2024"},{"id":"D","label":"Le Caire"}]'::jsonb,
    'C', 'Aucune ville africaine n''a encore accueilli les Jeux Olympiques. Dakar devrait accueillir les Jeux de la Jeunesse 2026.', 5),

    ('c3333333-3333-4333-8333-333333334006', 'b2222222-2222-4222-8222-222222222210', 'Dans quel sport Eliud Kipchoge est-il champion olympique ?',
    '[{"id":"A","label":"10 000 m"},{"id":"B","label":"Triathlon"},{"id":"C","label":"Marathon"},{"id":"D","label":"Décathlon"}]'::jsonb,
    'C', 'Eliud Kipchoge (Kenya) est double champion olympique du marathon (2016, 2021).', 6),

    ('c3333333-3333-4333-8333-333333334007', 'b2222222-2222-4222-8222-222222222210', 'Quelle est la devise olympique ?',
    '[{"id":"A","label":"Fortius, Citius, Altius"},{"id":"B","label":"Citius, Altius, Fortius — Communiter"},{"id":"C","label":"Altius, Fortius, Citius"},{"id":"D","label":"Plus vite, Plus haut, Plus fort"}]'::jsonb,
    'B', 'Depuis 2021, la devise olympique est "Citius, Altius, Fortius — Communiter" (Plus vite, Plus haut, Plus fort — Ensemble).', 7),

    ('c3333333-3333-4333-8333-333333334008', 'b2222222-2222-4222-8222-222222222210', 'Qui est le nageur le plus médaillé de l''histoire olympique ?',
    '[{"id":"A","label":"Mark Spitz"},{"id":"B","label":"Ian Thorpe"},{"id":"C","label":"Michael Phelps"},{"id":"D","label":"Ryan Lochte"}]'::jsonb,
    'C', 'Michael Phelps a remporté 28 médailles olympiques (23 en or) entre 2000 et 2016.', 8),

    ('c3333333-3333-4333-8333-333333334009', 'b2222222-2222-4222-8222-222222222210', 'Quelle ville accueille les Jeux Olympiques d''été 2024 ?',
    '[{"id":"A","label":"Los Angeles"},{"id":"B","label":"Tokyo"},{"id":"C","label":"Paris"},{"id":"D","label":"Brisbane"}]'::jsonb,
    'C', 'Paris a accueilli les Jeux Olympiques d''été 2024, 100 ans après les JO parisiens de 1924.', 9),

    ('c3333333-3333-4333-8333-333333334010', 'b2222222-2222-4222-8222-222222222210', 'Lequel de ces sports est entré aux JO en 2020 (Tokyo) ?',
    '[{"id":"A","label":"Surf"},{"id":"B","label":"Squash"},{"id":"C","label":"Cricket"},{"id":"D","label":"Polo"}]'::jsonb,
    'A', 'Le surf, le skateboard, l''escalade et le karaté ont fait leur entrée aux JO de Tokyo 2020.', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 11 — Tech & Numérique / Z1 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('c3333333-3333-4333-8333-333333334101', 'b2222222-2222-4222-8222-222222222211', 'Que signifie "IA" dans le domaine de la technologie ?',
    '[{"id":"A","label":"Interne automatisée"},{"id":"B","label":"Intelligence artificielle"},{"id":"C","label":"Interface automatique"},{"id":"D","label":"Informatique avancée"}]'::jsonb,
    'B', 'IA signifie Intelligence Artificielle, une branche de l''informatique simulant l''intelligence humaine.', 1),

    ('c3333333-3333-4333-8333-333333334102', 'b2222222-2222-4222-8222-222222222211', 'Quel pays a inventé le smartphone tel qu''on le connaît ?',
    '[{"id":"A","label":"Japon"},{"id":"B","label":"Corée du Sud"},{"id":"C","label":"États-Unis"},{"id":"D","label":"Chine"}]'::jsonb,
    'C', 'Steve Jobs a présenté le premier iPhone (Apple, USA) en janvier 2007, révolutionnant le marché.', 2),

    ('c3333333-3333-4333-8333-333333334103', 'b2222222-2222-4222-8222-222222222211', 'Que signifie "CPU" en informatique ?',
    '[{"id":"A","label":"Central Processing Unit"},{"id":"B","label":"Computer Power Unit"},{"id":"C","label":"Central Program Utility"},{"id":"D","label":"Core Processing Unit"}]'::jsonb,
    'A', 'CPU (Unité centrale de traitement) est le cerveau de l''ordinateur.', 3),

    ('c3333333-3333-4333-8333-333333334104', 'b2222222-2222-4222-8222-222222222211', 'Quel réseau social a été fondé par Mark Zuckerberg ?',
    '[{"id":"A","label":"Twitter"},{"id":"B","label":"Instagram"},{"id":"C","label":"Facebook"},{"id":"D","label":"LinkedIn"}]'::jsonb,
    'C', 'Facebook a été fondé par Mark Zuckerberg en 2004 depuis sa chambre d''université à Harvard.', 4),

    ('c3333333-3333-4333-8333-333333334105', 'b2222222-2222-4222-8222-222222222211', 'Qu''est-ce que le Bitcoin ?',
    '[{"id":"A","label":"Un réseau social"},{"id":"B","label":"Une cryptomonnaie décentralisée"},{"id":"C","label":"Un service cloud"},{"id":"D","label":"Un moteur de recherche"}]'::jsonb,
    'B', 'Le Bitcoin est une cryptomonnaie créée en 2009 par Satoshi Nakamoto, fonctionnant sans banque centrale.', 5),

    ('c3333333-3333-4333-8333-333333334106', 'b2222222-2222-4222-8222-222222222211', 'Combien de transistors contient approximativement un processeur moderne ?',
    '[{"id":"A","label":"Millions"},{"id":"B","label":"Milliards"},{"id":"C","label":"Milliers"},{"id":"D","label":"Billions"}]'::jsonb,
    'B', 'Les processeurs modernes contiennent des milliards de transistors (ex: M3 Ultra d''Apple : 153 milliards).', 6),

    ('c3333333-3333-4333-8333-333333334107', 'b2222222-2222-4222-8222-222222222211', 'Qu''est-ce que l''Internet des Objets (IoT) ?',
    '[{"id":"A","label":"Un réseau de satellites"},{"id":"B","label":"La connexion d''appareils physiques à Internet"},{"id":"C","label":"Un protocole de sécurité"},{"id":"D","label":"Un système d''exploitation"}]'::jsonb,
    'B', 'L''IoT désigne la connexion d''objets physiques (frigos, voitures, montres…) à Internet.', 7),

    ('c3333333-3333-4333-8333-333333334108', 'b2222222-2222-4222-8222-222222222211', 'Quelle entreprise africaine a créé le paiement mobile M-Pesa ?',
    '[{"id":"A","label":"MTN"},{"id":"B","label":"Orange"},{"id":"C","label":"Safaricom"},{"id":"D","label":"Airtel"}]'::jsonb,
    'C', 'M-Pesa a été lancé par Safaricom au Kenya en 2007, révolutionnant le paiement mobile en Afrique.', 8),

    ('c3333333-3333-4333-8333-333333334109', 'b2222222-2222-4222-8222-222222222211', 'Que signifie "open source" ?',
    '[{"id":"A","label":"Un logiciel gratuit"},{"id":"B","label":"Un code source accessible et modifiable par tous"},{"id":"C","label":"Un logiciel sans virus"},{"id":"D","label":"Un service en ligne"}]'::jsonb,
    'B', 'Open source désigne un logiciel dont le code source est public et que tout le monde peut modifier.', 9),

    ('c3333333-3333-4333-8333-333333334110', 'b2222222-2222-4222-8222-222222222211', 'Quelle technologie est utilisée pour la réalité augmentée ?',
    '[{"id":"A","label":"GPS et blockchain"},{"id":"B","label":"Caméra + superposition 3D en temps réel"},{"id":"C","label":"IA et big data uniquement"},{"id":"D","label":"Fibre optique"}]'::jsonb,
    'B', 'La réalité augmentée superpose des éléments virtuels 3D sur le monde réel via une caméra.', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 12 — Entrepreneurs africains / Z1 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('c3333333-3333-4333-8333-333333334201', 'b2222222-2222-4222-8222-222222222212', 'Qui a fondé Dangote Group, le plus grand conglomérat d''Afrique ?',
    '[{"id":"A","label":"Elon Musk"},{"id":"B","label":"Patrice Motsepe"},{"id":"C","label":"Aliko Dangote"},{"id":"D","label":"Mike Adenuga"}]'::jsonb,
    'C', 'Aliko Dangote (Nigeria) a fondé le Dangote Group et est souvent classé homme le plus riche d''Afrique.', 1),

    ('c3333333-3333-4333-8333-333333334202', 'b2222222-2222-4222-8222-222222222212', 'Qu''est-ce que Jumia, surnommé "l''Amazon africain" ?',
    '[{"id":"A","label":"Un réseau social"},{"id":"B","label":"Une plateforme de livraison"},{"id":"C","label":"Une plateforme e-commerce"},{"id":"D","label":"Un service bancaire"}]'::jsonb,
    'C', 'Jumia est la première grande plateforme e-commerce africaine, fondée en 2012 et présente dans 11 pays.', 2),

    ('c3333333-3333-4333-8333-333333334203', 'b2222222-2222-4222-8222-222222222212', 'Quel Sénégalais dirige le groupe Auchan en Afrique de l''Ouest ?',
    '[{"id":"A","label":"Yérim Sow"},{"id":"B","label":"Abdoulaye Sylla"},{"id":"C","label":"Cheikh Tidiane Mbaye"},{"id":"D","label":"Ibrahima Dia"}]'::jsonb,
    'A', 'Yérim Sow est un milliardaire sénégalais, fondateur du groupe Teyliom et partenaire de Auchan en Afrique.', 3),

    ('c3333333-3333-4333-8333-333333334204', 'b2222222-2222-4222-8222-222222222212', 'Que signifie "fintech" ?',
    '[{"id":"A","label":"Finance et technologie"},{"id":"B","label":"Finances étrangères"},{"id":"C","label":"Financement technique"},{"id":"D","label":"Fonds technologique"}]'::jsonb,
    'A', 'Fintech = Financial Technology. Désigne les entreprises qui innovent dans les services financiers via la technologie.', 4),

    ('c3333333-3333-4333-8333-333333334205', 'b2222222-2222-4222-8222-222222222212', 'Quel pays africain est considéré comme la Silicon Valley du continent ?',
    '[{"id":"A","label":"Nigeria"},{"id":"B","label":"Kenya"},{"id":"C","label":"Rwanda"},{"id":"D","label":"Afrique du Sud"}]'::jsonb,
    'B', 'Nairobi (Kenya) abrite le "Silicon Savannah", principal hub tech africain avec de nombreuses startups.', 5),

    ('c3333333-3333-4333-8333-333333334206', 'b2222222-2222-4222-8222-222222222212', 'Qu''est-ce que Wave, très populaire en Afrique de l''Ouest ?',
    '[{"id":"A","label":"Un réseau social"},{"id":"B","label":"Une application de transfert d''argent mobile"},{"id":"C","label":"Une banque traditionnelle"},{"id":"D","label":"Un service de streaming"}]'::jsonb,
    'B', 'Wave est une application fintech qui permet des transferts d''argent mobile à faible coût, très populaire au Sénégal et en Côte d''Ivoire.', 6),

    ('c3333333-3333-4333-8333-333333334207', 'b2222222-2222-4222-8222-222222222212', 'Quel entrepreneur a fondé la compagnie African Airlines Rwandair ?',
    '[{"id":"A","label":"Paul Kagamé (initiative gouvernementale)"},{"id":"B","label":"Tony Elumelu"},{"id":"C","label":"Strive Masiyiwa"},{"id":"D","label":"Folorunso Alakija"}]'::jsonb,
    'A', 'RwandAir est la compagnie aérienne nationale du Rwanda, soutenue par le gouvernement de Paul Kagamé.', 7),

    ('c3333333-3333-4333-8333-333333334208', 'b2222222-2222-4222-8222-222222222212', 'Strive Masiyiwa est connu pour avoir fondé quel groupe télécoms ?',
    '[{"id":"A","label":"MTN"},{"id":"B","label":"Econet"},{"id":"C","label":"Airtel"},{"id":"D","label":"Glo"}]'::jsonb,
    'B', 'Strive Masiyiwa (Zimbabwe) a fondé Econet Wireless, présent dans plus de 15 pays africains.', 8),

    ('c3333333-3333-4333-8333-333333334209', 'b2222222-2222-4222-8222-222222222212', 'Qu''est-ce que le programme "Tony Elumelu Foundation" ?',
    '[{"id":"A","label":"Un fonds d''investissement immobilier"},{"id":"B","label":"Un programme qui finance des entrepreneurs africains"},{"id":"C","label":"Un parti politique"},{"id":"D","label":"Une ONG humanitaire"}]'::jsonb,
    'B', 'La Tony Elumelu Foundation finance et accompagne 1 000 entrepreneurs africains par an avec 5 000 USD chacun.', 9),

    ('c3333333-3333-4333-8333-333333334210', 'b2222222-2222-4222-8222-222222222212', 'Quelle femme est la milliardaire africaine la plus riche ?',
    '[{"id":"A","label":"Isabelle Dos Santos"},{"id":"B","label":"Folorunso Alakija"},{"id":"C","label":"Ngozi Okonjo-Iweala"},{"id":"D","label":"Tidjane Thiam"}]'::jsonb,
    'A', 'Isabelle dos Santos (Angola) a été pendant longtemps la femme la plus riche d''Afrique, bien que sa fortune soit aujourd''hui contestée.', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 13 — Musiques d''Afrique / Z0 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('c3333333-3333-4333-8333-333333334301', 'b2222222-2222-4222-8222-222222222213', 'Quel genre musical est originaire du Nigeria et mêle highlife et funk ?',
    '[{"id":"A","label":"Mbalax"},{"id":"B","label":"Afrobeats"},{"id":"C","label":"Soukous"},{"id":"D","label":"Kwaito"}]'::jsonb,
    'B', 'L''Afrobeats, popularisé par Fela Kuti puis Wizkid et Burna Boy, est né au Nigeria dans les années 2010.', 1),

    ('c3333333-3333-4333-8333-333333334302', 'b2222222-2222-4222-8222-222222222213', 'Quel artiste sénégalais a créé et popularisé le Mbalax ?',
    '[{"id":"A","label":"Ismaël Lô"},{"id":"B","label":"Youssou N''Dour"},{"id":"C","label":"Baaba Maal"},{"id":"D","label":"Omar Pene"}]'::jsonb,
    'B', 'Youssou N''Dour, chanteur de renommée mondiale, a popularisé le Mbalax à travers le monde.', 2),

    ('c3333333-3333-4333-8333-333333334303', 'b2222222-2222-4222-8222-222222222213', 'Qu''est-ce que le "Griot" dans la culture ouest-africaine ?',
    '[{"id":"A","label":"Un instrument de musique"},{"id":"B","label":"Un gardien de la tradition orale et musicale"},{"id":"C","label":"Un style de danse"},{"id":"D","label":"Un genre musical moderne"}]'::jsonb,
    'B', 'Le griot est un gardien de la mémoire, conteur, musicien et historien dans les sociétés d''Afrique de l''Ouest.', 3),

    ('c3333333-3333-4333-8333-333333334304', 'b2222222-2222-4222-8222-222222222213', 'Quel artiste camerounais est surnommé "le Lion indomptable" de la musique ?',
    '[{"id":"A","label":"Manu Dibango"},{"id":"B","label":"Richard Bona"},{"id":"C","label":"Charlotte Dipanda"},{"id":"D","label":"Petit Pays"}]'::jsonb,
    'A', 'Manu Dibango (1933-2020) a créé "Soul Makossa" et est une icône mondiale de la musique africaine.', 4),

    ('c3333333-3333-4333-8333-333333334305', 'b2222222-2222-4222-8222-222222222213', 'Quel instrument africain est emblématique de la musique malienne ?',
    '[{"id":"A","label":"Djembé"},{"id":"B","label":"Kora"},{"id":"C","label":"Balafon"},{"id":"D","label":"Ngoni"}]'::jsonb,
    'B', 'La kora, harpe-luth à 21 cordes, est l''instrument emblématique de la musique mandingue du Mali.', 5),

    ('c3333333-3333-4333-8333-333333334306', 'b2222222-2222-4222-8222-222222222213', 'Burna Boy est originaire de quel pays ?',
    '[{"id":"A","label":"Ghana"},{"id":"B","label":"Côte d''Ivoire"},{"id":"C","label":"Nigeria"},{"id":"D","label":"Afrique du Sud"}]'::jsonb,
    'C', 'Burna Boy (Damini Ebunoluwa Ogulu) est un artiste Afrobeats nigérian, vainqueur du Grammy Award 2021.', 6),

    ('c3333333-3333-4333-8333-333333334307', 'b2222222-2222-4222-8222-222222222213', 'Quel genre musical est originaire d''Afrique du Sud ?',
    '[{"id":"A","label":"Kwaito"},{"id":"B","label":"Highlife"},{"id":"C","label":"Rumba"},{"id":"D","label":"Coupé-décalé"}]'::jsonb,
    'A', 'Le Kwaito est un genre musical né à Johannesburg dans les années 1990, mêlant house et influences locales.', 7),

    ('c3333333-3333-4333-8333-333333334308', 'b2222222-2222-4222-8222-222222222213', 'Qui est Miriam Makeba, surnommée "Mama Africa" ?',
    '[{"id":"A","label":"Une reine nigériane"},{"id":"B","label":"Une chanteuse militante sud-africaine"},{"id":"C","label":"Une actrice égyptienne"},{"id":"D","label":"Une poétesse sénégalaise"}]'::jsonb,
    'B', 'Miriam Makeba (1932-2008) était une chanteuse et militante anti-apartheid sud-africaine de renommée mondiale.', 8),

    ('c3333333-3333-4333-8333-333333334309', 'b2222222-2222-4222-8222-222222222213', 'Quel instrument à percussion est utilisé dans la musique traditionnelle sénégalaise ?',
    '[{"id":"A","label":"Djembé"},{"id":"B","label":"Tama (tambour parlant)"},{"id":"C","label":"Balafon"},{"id":"D","label":"Kpanlogo"}]'::jsonb,
    'B', 'Le tama, dit "tambour parlant", est emblématique de la musique traditionnelle sénégalaise.', 9),

    ('c3333333-3333-4333-8333-333333334310', 'b2222222-2222-4222-8222-222222222213', 'Quel artiste a popularisé l''Afrobeats à l''échelle mondiale avec "Essence" ?',
    '[{"id":"A","label":"Davido"},{"id":"B","label":"Wizkid"},{"id":"C","label":"Tiwa Savage"},{"id":"D","label":"Ckay"}]'::jsonb,
    'B', 'Wizkid et Tems ont popularisé l''afrobeats mondialement avec "Essence" (2020), tube certifié platine aux USA.', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 14 — Art & Culture africaine / Z2 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('c3333333-3333-4333-8333-333333334401', 'b2222222-2222-4222-8222-222222222214', 'Qu''est-ce que la Négritude en littérature ?',
    '[{"id":"A","label":"Un courant artistique afro-américain"},{"id":"B","label":"Un mouvement affirmant la fierté et l''identité africaine"},{"id":"C","label":"Un style de peinture"},{"id":"D","label":"Un genre musical"}]'::jsonb,
    'B', 'La Négritude est un mouvement littéraire fondé par Senghor, Césaire et Damas dans les années 1930.', 1),

    ('c3333333-3333-4333-8333-333333334402', 'b2222222-2222-4222-8222-222222222214', 'Quel artiste contemporain africain est célèbre pour ses sculptures de masques en fil de fer ?',
    '[{"id":"A","label":"El Anatsui"},{"id":"B","label":"Chéri Samba"},{"id":"C","label":"Gonçalo Mabunda"},{"id":"D","label":"Yinka Shonibare"}]'::jsonb,
    'A', 'El Anatsui (Ghana/Nigeria) est mondialement connu pour ses œuvres monumentales faites de capsules de bouteilles.', 2),

    ('c3333333-3333-4333-8333-333333334403', 'b2222222-2222-4222-8222-222222222214', 'Les masques africains avaient principalement quel rôle traditionnel ?',
    '[{"id":"A","label":"Décoration murale"},{"id":"B","label":"Rituel spirituel et social"},{"id":"C","label":"Protection militaire"},{"id":"D","label":"Commerce"}]'::jsonb,
    'B', 'Les masques africains jouent un rôle central dans les rituels, les cérémonies d''initiation et la communication avec les ancêtres.', 3),

    ('c3333333-3333-4333-8333-333333334404', 'b2222222-2222-4222-8222-222222222214', 'Qui est Seydou Keïta, célèbre au Mali ?',
    '[{"id":"A","label":"Un musicien"},{"id":"B","label":"Un peintre"},{"id":"C","label":"Un photographe"},{"id":"D","label":"Un sculpteur"}]'::jsonb,
    'C', 'Seydou Keïta (1923-2001) est l''un des plus grands photographes africains, connu pour ses portraits des années 1940-1960 à Bamako.', 4),

    ('c3333333-3333-4333-8333-333333334405', 'b2222222-2222-4222-8222-222222222214', 'Quel tissu coloré est emblématique de l''Afrique de l''Ouest ?',
    '[{"id":"A","label":"Kente"},{"id":"B","label":"Kanga"},{"id":"C","label":"Bogolan"},{"id":"D","label":"Dashiki"}]'::jsonb,
    'A', 'Le Kente est un tissu royal ghanéen aux couleurs vives, tissé à la main et symbole de prestige.', 5),

    ('c3333333-3333-4333-8333-333333334406', 'b2222222-2222-4222-8222-222222222214', 'La Biennale de Dakar est consacrée à quoi ?',
    '[{"id":"A","label":"La musique africaine"},{"id":"B","label":"L''art contemporain africain"},{"id":"C","label":"La mode africaine"},{"id":"D","label":"Le cinéma africain"}]'::jsonb,
    'B', 'La Biennale de Dakar (Dak''Art) est l''un des plus importants festivals d''art contemporain africain, fondé en 1992.', 6),

    ('c3333333-3333-4333-8333-333333334407', 'b2222222-2222-4222-8222-222222222214', 'Quel romancier nigérian a écrit "Things Fall Apart" ?',
    '[{"id":"A","label":"Wole Soyinka"},{"id":"B","label":"Chimamanda Ngozi Adichie"},{"id":"C","label":"Chinua Achebe"},{"id":"D","label":"Ben Okri"}]'::jsonb,
    'C', 'Chinua Achebe (1930-2013) a écrit "Things Fall Apart" (1958), l''un des romans africains les plus lus au monde.', 7),

    ('c3333333-3333-4333-8333-333333334408', 'b2222222-2222-4222-8222-222222222214', 'Qu''est-ce que le "Bogolan" ou "tissu de boue" ?',
    '[{"id":"A","label":"Un tissu malien teint à l''argile fermentée"},{"id":"B","label":"Un batik nigérian"},{"id":"C","label":"Un tissu éthiopien"},{"id":"D","label":"Une poterie camerounaise"}]'::jsonb,
    'A', 'Le Bogolan est un tissu traditionnel malien fabriqué et teint à l''aide de boue fermentée, créant des motifs géométriques.', 8),

    ('c3333333-3333-4333-8333-333333334409', 'b2222222-2222-4222-8222-222222222214', 'Quel Africain a remporté le Prix Nobel de Littérature en 1986 ?',
    '[{"id":"A","label":"Chinua Achebe"},{"id":"B","label":"Ngugi wa Thiong''o"},{"id":"C","label":"Wole Soyinka"},{"id":"D","label":"Nadine Gordimer"}]'::jsonb,
    'C', 'Wole Soyinka (Nigeria) a été le premier auteur africain noir à remporter le Prix Nobel de Littérature en 1986.', 9),

    ('c3333333-3333-4333-8333-333333334410', 'b2222222-2222-4222-8222-222222222214', 'Quel festival culturel africain est l''équivalent des Oscars pour le cinéma africain ?',
    '[{"id":"A","label":"FESPACO"},{"id":"B","label":"FESTAC"},{"id":"C","label":"Cannes Afrique"},{"id":"D","label":"FIFF"}]'::jsonb,
    'A', 'Le FESPACO (Festival Panafricain du Cinéma et de la Télévision de Ouagadougou) est le plus grand festival de cinéma africain.', 10)
  ON CONFLICT (id) DO NOTHING;


  -- ─────────────────────────────────────────
  -- QUIZ 15 — La vie en ville / Z0 (10 Q)
  -- ─────────────────────────────────────────
  INSERT INTO questions (id, quiz_id, question_text, options, correct_option_id, explanation, order_index)
  VALUES
    ('c3333333-3333-4333-8333-333333334501', 'b2222222-2222-4222-8222-222222222215', 'Comment s''appelle le principal marché de Dakar ?',
    '[{"id":"A","label":"Marché Kermel"},{"id":"B","label":"Marché Sandaga"},{"id":"C","label":"Marché HLM"},{"id":"D","label":"Marché Tilène"}]'::jsonb,
    'B', 'Le marché Sandaga est le plus célèbre et l''un des plus animés de Dakar, situé en plein centre-ville.', 1),

    ('c3333333-3333-4333-8333-333333334502', 'b2222222-2222-4222-8222-222222222215', 'Quel transport en commun est emblématique de Dakar ?',
    '[{"id":"A","label":"Le métro"},{"id":"B","label":"Le Car Rapide"},{"id":"C","label":"Le tramway"},{"id":"D","label":"Le monorail"}]'::jsonb,
    'B', 'Le Car Rapide, minibus coloré et décoré, est l''icône du transport urbain dakarois depuis des décennies.', 2),

    ('c3333333-3333-4333-8333-333333334503', 'b2222222-2222-4222-8222-222222222215', 'Que signifie "Téranga" en wolof ?',
    '[{"id":"A","label":"Paix"},{"id":"B","label":"Hospitalité"},{"id":"C","label":"Famille"},{"id":"D","label":"Travail"}]'::jsonb,
    'B', 'Téranga signifie hospitalité en wolof. C''est une valeur centrale de la culture sénégalaise.', 3),

    ('c3333333-3333-4333-8333-333333334504', 'b2222222-2222-4222-8222-222222222215', 'Quel est le plat national du Sénégal ?',
    '[{"id":"A","label":"Yassa"},{"id":"B","label":"Thiéboudienne"},{"id":"C","label":"Mafé"},{"id":"D","label":"Dibi"}]'::jsonb,
    'B', 'La Thiéboudienne (riz au poisson) est le plat national du Sénégal, inscrit au patrimoine culturel immatériel de l''UNESCO.', 4),

    ('c3333333-3333-4333-8333-333333334505', 'b2222222-2222-4222-8222-222222222215', 'Quel quartier de Dakar est connu pour ses galeries d''art et restaurants ?',
    '[{"id":"A","label":"Pikine"},{"id":"B","label":"Plateau"},{"id":"C","label":"Almadies"},{"id":"D","label":"Parcelles Assainies"}]'::jsonb,
    'C', 'Les Almadies, quartier huppé en bord de mer à Dakar, concentrent galeries, restaurants et clubs branchés.', 5),

    ('c3333333-3333-4333-8333-333333334506', 'b2222222-2222-4222-8222-222222222215', 'Quel bâtiment est le symbole de la ville de Dakar ?',
    '[{"id":"A","label":"La Grande Mosquée"},{"id":"B","label":"Le Monument de la Renaissance africaine"},{"id":"C","label":"Le Palais de justice"},{"id":"D","label":"L''Assemblée nationale"}]'::jsonb,
    'B', 'Le Monument de la Renaissance africaine, inauguré en 2010, est la plus haute statue d''Afrique (52 m) et symbole de Dakar.', 6),

    ('c3333333-3333-4333-8333-333333334507', 'b2222222-2222-4222-8222-222222222215', 'Quelle boisson chaude est très populaire au Sénégal le matin ?',
    '[{"id":"A","label":"Thé vert"},{"id":"B","label":"Café Touba"},{"id":"C","label":"Chocolat chaud"},{"id":"D","label":"Lait chaud"}]'::jsonb,
    'B', 'Le Café Touba, café épicé aux clous de girofle et poivre, est la boisson matinale préférée des Sénégalais.', 7),

    ('c3333333-3333-4333-8333-333333334508', 'b2222222-2222-4222-8222-222222222215', 'Quel est le code téléphonique international du Sénégal ?',
    '[{"id":"A","label":"+220"},{"id":"B","label":"+225"},{"id":"C","label":"+221"},{"id":"D","label":"+222"}]'::jsonb,
    'C', 'Le code téléphonique international du Sénégal est +221.', 8),

    ('c3333333-3333-4333-8333-333333334509', 'b2222222-2222-4222-8222-222222222215', 'Quel réseau de bus moderne a été lancé à Dakar en 2022 ?',
    '[{"id":"A","label":"Dakar Bus Rapide Transit (BRT)"},{"id":"B","label":"DDD Bus"},{"id":"C","label":"Car Express"},{"id":"D","label":"Dakar Metro Bus"}]'::jsonb,
    'A', 'Le BRT (Bus Rapid Transit) de Dakar a été lancé en 2024, reliant Guédiawaye au centre-ville de Dakar.', 9),

    ('c3333333-3333-4333-8333-333333334510', 'b2222222-2222-4222-8222-222222222215', 'Combien de régions administratives compte le Sénégal ?',
    '[{"id":"A","label":"10"},{"id":"B","label":"12"},{"id":"C","label":"14"},{"id":"D","label":"16"}]'::jsonb,
    'C', 'Le Sénégal est divisé en 14 régions administratives depuis la réforme de 2008.', 10)
  ON CONFLICT (id) DO NOTHING;

