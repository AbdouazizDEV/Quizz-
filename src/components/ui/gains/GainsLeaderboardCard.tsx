import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import type { GainsLeaderboardRow, GainsPeriod } from '@app-types/gains.types';

const PERIODS: { id: GainsPeriod; label: string }[] = [
  { id: 'week', label: 'Semaine' },
  { id: 'month', label: 'Mois' },
  { id: 'year', label: 'Année' },
];

interface GainsLeaderboardCardProps {
  rows: GainsLeaderboardRow[];
  onSeeAll?: () => void;
}

export function GainsLeaderboardCard({ rows, onSeeAll }: GainsLeaderboardCardProps) {
  const [period, setPeriod] = useState<GainsPeriod>('week');

  return (
    <Animated.View entering={FadeInDown.delay(140).duration(420)} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBubble}>
          <Feather name="flag" size={16} color="#1F2347" />
        </View>
        <Text style={styles.title}>Classement</Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} hitSlop={8}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.tabs}>
        {PERIODS.map((p) => {
          const active = p.id === period;
          return (
            <Pressable
              key={p.id}
              onPress={() => setPeriod(p.id)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{p.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.list}>
        {rows.length === 0 ? (
          <Text style={styles.empty}>Classement en cours de chargement…</Text>
        ) : (
          rows.map((row, index) => (
            <Animated.View
              key={`${period}-${row.id}`}
              entering={FadeInRight.delay(40 * index).duration(320)}
              style={[styles.row, row.isMe && styles.rowMe]}
            >
              <Text style={[styles.rank, row.isMe && styles.rankMe]}>#{row.rank}</Text>
              <Text style={[styles.name, row.isMe && styles.nameMe]} numberOfLines={1}>
                {row.isMe ? 'Toi' : row.name}
              </Text>
              <Text style={[styles.pts, row.isMe && styles.ptsMe]}>
                {new Intl.NumberFormat('fr-FR').format(row.points)} pts
              </Text>
            </Animated.View>
          ))
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
    gap: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,183,3,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: '#212121' },
  seeAll: { fontSize: 13, fontWeight: '700', color: '#C9A000' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#FFB703' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#757575' },
  tabTextActive: { color: '#1F2347' },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  rowMe: {
    backgroundColor: 'rgba(255,183,3,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,183,3,0.45)',
  },
  rank: { width: 36, fontWeight: '800', color: '#9E9E9E', fontSize: 13 },
  rankMe: { color: '#1F2347' },
  name: { flex: 1, fontWeight: '700', color: '#424242', fontSize: 14 },
  nameMe: { color: '#1F2347' },
  pts: { fontWeight: '700', color: '#616161', fontSize: 13 },
  ptsMe: { color: '#C9A000' },
  empty: { fontSize: 13, color: '#9E9E9E', textAlign: 'center', paddingVertical: 12 },
});
