import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { CountdownTimer } from '@components/atoms/CountdownTimer';
import { COLORS } from '@constants/Colors';
import type { DuelSummary } from '@app-types/challenge.types';

function getActiveDuelLabel(duel: DuelSummary, userId: string): string {
  const opponent = duel.challengerId === userId ? duel.challengedName : duel.challengerName;

  if (duel.phase === 'expired' || duel.isExpired) {
    return `Duel expiré vs ${opponent}`;
  }

  switch (duel.phase) {
    case 'needs_your_acceptance':
      return `${duel.challengerName} vous a défié`;
    case 'waiting_opponent_acceptance':
      return `En attente que ${opponent} accepte`;
    case 'your_turn':
      return `À vous de jouer vs ${opponent}`;
    case 'waiting_opponent_play':
      return `En attente de ${opponent}`;
    default:
      return `Duel vs ${opponent}`;
  }
}

function getActiveDuelMeta(duel: DuelSummary, userId: string): string {
  const isChallenger = duel.challengerId === userId;
  const myScore = isChallenger ? duel.challengerScore : duel.challengedScore;

  if (duel.phase === 'expired' || duel.isExpired) {
    return myScore === null
      ? 'Délai dépassé · Vous n\'avez pas joué'
      : 'Délai dépassé · Partie non terminée';
  }

  if (duel.phase === 'needs_your_acceptance') {
    return `${duel.questionsCount} questions · 30 min pour accepter`;
  }
  if (duel.phase === 'waiting_opponent_acceptance') {
    return myScore !== null
      ? `Score envoyé (${myScore} pts) · En attente d'acceptation`
      : `${duel.questionsCount} questions · Défi envoyé`;
  }
  if (duel.phase === 'your_turn') {
    return `${duel.questionsCount} questions · Lancez votre partie`;
  }
  if (duel.phase === 'waiting_opponent_play') {
    return `Votre score : ${myScore ?? 0} pts · Adversaire n'a pas encore joué`;
  }
  return `${duel.questionsCount} questions`;
}

interface ActiveDuelCardProps {
  duel: DuelSummary;
  userId: string;
  busy: boolean;
  onRespond: (duelId: string, accept: boolean, challengerName: string) => void;
  onOpen: () => void;
}

export function ActiveDuelCard({ duel, userId, busy, onRespond, onOpen }: ActiveDuelCardProps) {
  const title = getActiveDuelLabel(duel, userId);
  const meta = getActiveDuelMeta(duel, userId);
  const showAcceptDecline = duel.phase === 'needs_your_acceptance' && !duel.isExpired;
  const showPlay =
    !duel.isExpired &&
    (duel.phase === 'your_turn' || duel.phase === 'waiting_opponent_acceptance');

  return (
    <View style={styles.card}>
      <Pressable onPress={onOpen} accessibilityRole="button">
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
        {!duel.isExpired ? (
          <View style={styles.timer}>
            <CountdownTimer endsAt={duel.expiresAt} />
          </View>
        ) : null}
      </Pressable>
      {showAcceptDecline ? (
        <View style={styles.actions}>
          <Pressable
            style={[styles.acceptBtn, busy && styles.btnDisabled]}
            disabled={busy}
            onPress={() => onRespond(duel.id, true, duel.challengerName)}
          >
            {busy ? (
              <ActivityIndicator color={COLORS.textLight} size="small" />
            ) : (
              <Text style={styles.acceptBtnText}>Accepter</Text>
            )}
          </Pressable>
          <Pressable
            style={[styles.declineBtn, busy && styles.btnDisabled]}
            disabled={busy}
            onPress={() => onRespond(duel.id, false, duel.challengerName)}
          >
            <Text style={styles.declineBtnText}>Refuser</Text>
          </Pressable>
        </View>
      ) : null}
      {showPlay ? (
        <Pressable style={styles.openBtn} onPress={onOpen}>
          <Text style={styles.openBtnText}>
            {duel.phase === 'your_turn' ? 'Jouer maintenant →' : 'Voir le duel →'}
          </Text>
        </Pressable>
      ) : null}
      {duel.phase === 'waiting_opponent_play' ? (
        <Text style={styles.hint}>Vous serez notifié quand l&apos;adversaire aura joué.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  meta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  timer: {
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  hint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  openBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
  },
  openBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.textLight,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textLight,
    fontSize: 14,
  },
  declineBtn: {
    flex: 1,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  declineBtnText: {
    fontFamily: 'Nunito_700Bold',
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
