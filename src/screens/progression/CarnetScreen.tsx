import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BadgeGrid } from '@components/ui/badges/BadgeGrid';
import { bodyText, titleText } from '@constants/appText';
import { Colors } from '@constants/Colors';
import { Routes } from '@constants/Routes';
import { readApiError } from '@services/payments/paymentsRepository';
import {
  optionChoices,
  progressionApi,
  type CategoryStat,
  type Notebook,
  type PlayerBadge,
  type ReviewQuestion,
  type StyleItem,
  type WeeklyGoal,
} from '@services/progression/progressionRepository';

import { PremiumCard, PremiumCta, PremiumScaffold } from '@screens/premium/premiumUi';

export default function CarnetScreen() {
  const router = useRouter();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [badges, setBadges] = useState<PlayerBadge[]>([]);
  const [stylesCatalog, setStylesCatalog] = useState<StyleItem[]>([]);
  const [goal, setGoal] = useState<WeeklyGoal | null>(null);
  const [stats, setStats] = useState<CategoryStat[]>([]);
  const [review, setReview] = useState<ReviewQuestion[] | null>(null);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  const load = useCallback(async () => {
    setNotice(null);
    const badgeRes = await progressionApi.badges().catch(() => null);
    if (badgeRes) setBadges(badgeRes.badges);
    const styleRes = await progressionApi.style().catch(() => null);
    if (styleRes) setStylesCatalog(styleRes.catalog);
    try {
      const [book, goalRes, statsRes] = await Promise.all([
        progressionApi.notebook(),
        progressionApi.goal(),
        progressionApi.stats(),
      ]);
      setNotebook(book);
      setGoal(goalRes);
      setStats(statsRes.categories);
      setLocked(false);
    } catch (error) {
      const message = readApiError(error, 'Action impossible pour le moment.');
      setLocked(message.includes('réservé au Premium'));
      setNotice(message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const equip = async (item: StyleItem) => {
    const key = item.kind === 'frame' ? 'frame_code' : item.kind === 'theme' ? 'theme_code' : 'avatar_code';
    try {
      await progressionApi.equip({ [key]: item.code });
      await load();
    } catch (error) {
      setNotice(readApiError(error, 'Ce style n’est pas disponible.'));
    }
  };

  const submitReview = async () => {
    if (!review) return;
    try {
      const result = await progressionApi.submitReview(
        review.map((question) => ({ questionId: question.question_id, selected: picks[question.question_id] })),
      );
      setNotice(`${result.resolved} erreur(s) corrigée(s). Points ajoutés : ${result.points_awarded}.`);
      setReview(null);
      await load();
    } catch (error) {
      setNotice(readApiError(error, 'La révision n’a pas pu être envoyée.'));
    }
  };

  return (
    <PremiumScaffold title="Carnet" onBack={() => router.back()}>
      <PremiumCard>
        <Text style={styles.title}>Carnet d’erreurs</Text>
        <Text style={styles.body}>La révision n’ajoute aucun point au classement.</Text>
        {locked ? <PremiumCta label="Voir le Premium" onPress={() => router.push(Routes.PREMIUM)} /> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {notebook ? <Text style={styles.body}>{notebook.open_count} question(s) encore ouvertes.</Text> : null}
        {notebook?.categories.map((category) => (
          <View key={category.category_name} style={styles.block}>
            <Text style={styles.subtitle}>{category.category_name} · {category.open_count}</Text>
            {category.mistakes.map((mistake) => (
              <Text key={mistake.question_id} style={styles.body}>
                {mistake.question_text}
                {'\n'}Ta réponse : {mistake.your_answer ?? '—'} · Bonne réponse : {mistake.correct_answer ?? '—'}
                {mistake.explanation ? `\n${mistake.explanation}` : ''}
              </Text>
            ))}
          </View>
        ))}
        {!review && notebook && notebook.open_count > 0 ? (
          <PremiumCta
            label="Refaire les questions ratées"
            onPress={() => {
              void progressionApi.review().then((res) => {
                setReview(res.questions);
                setPicks({});
              }).catch((error) => setNotice(readApiError(error, 'La révision est indisponible.')));
            }}
          />
        ) : null}
        {review?.map((question) => (
          <View key={question.question_id} style={styles.block}>
            <Text style={styles.subtitle}>{question.question_text}</Text>
            {optionChoices(question.options).map((option) => {
              const selected = picks[question.question_id] === option.id;
              return (
                <Pressable key={option.id} onPress={() => setPicks((current) => ({ ...current, [question.question_id]: option.id }))} style={[styles.choice, selected && styles.choiceOn]}>
                  <Text style={styles.body}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
        {review ? <PremiumCta label="Corriger sans marquer de points" onPress={() => void submitReview()} /> : null}
      </PremiumCard>

      <PremiumCard>
        <Text style={styles.title}>Badges d’Afrique de l’Ouest</Text>
        <Text style={styles.body}>
          Médaillons de terre cuite, indigo waxi et or du Sahel. Un badge non obtenu reste le même objet, mat.
        </Text>
        <BadgeGrid badges={badges} />
      </PremiumCard>

      <PremiumCard>
        <Text style={styles.title}>Style</Text>
        {(['frame', 'theme', 'avatar'] as const).map((kind) => (
          <View key={kind} style={styles.block}>
            <Text style={styles.subtitle}>{kind === 'frame' ? 'Cadre' : kind === 'theme' ? 'Thème' : 'Avatar'}</Text>
            <View style={styles.chips}>
              {stylesCatalog.filter((item) => item.kind === kind).map((item) => (
                <Pressable key={item.code} disabled={item.locked} onPress={() => void equip(item)} style={[styles.chip, item.locked && styles.chipOff]}>
                  <Text style={styles.chipText}>{item.name}{item.locked ? ' · Premium' : ''}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </PremiumCard>

      {goal ? (
        <PremiumCard>
          <Text style={styles.title}>Objectif de la semaine</Text>
          <Text style={styles.body}>{goal.label} · {goal.progress}/{goal.target}</Text>
          <PremiumCta
            label={goal.reminder_enabled ? 'Rappel activé' : 'Activer le rappel'}
            onPress={() => {
              void progressionApi.reminder(!goal.reminder_enabled).then(() => load()).catch((error) => setNotice(readApiError(error, 'Le rappel n’a pas été enregistré.')));
            }}
          />
          <PremiumCta
            label="Geler la série"
            onPress={() => {
              void progressionApi.freeze().then(() => load()).catch((error) => setNotice(readApiError(error, 'Le gel n’est pas disponible.')));
            }}
          />
        </PremiumCard>
      ) : null}

      {stats.length > 0 ? (
        <PremiumCard>
          <Text style={styles.title}>30 derniers jours</Text>
          {stats.map((row) => (
            <Text key={row.category_name} style={styles.body}>
              {row.category_name} · {row.plays} parties classées · {row.open_mistakes} erreurs ouvertes
            </Text>
          ))}
        </PremiumCard>
      ) : null}
    </PremiumScaffold>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, ...titleText, color: Colors.textPrimary },
  subtitle: { fontSize: 15, ...titleText, color: Colors.textPrimary },
  body: { fontSize: 14, ...bodyText, color: Colors.textSecondary, lineHeight: 20 },
  notice: { fontSize: 14, ...titleText, color: Colors.primary, lineHeight: 20 },
  block: { gap: 6 },
  choice: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 10 },
  choiceOn: { borderColor: Colors.primary, backgroundColor: Colors.premiumSurface },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 8 },
  chipOff: { opacity: 0.45 },
  chipText: { ...bodyText, color: Colors.textPrimary, fontSize: 13 },
});
