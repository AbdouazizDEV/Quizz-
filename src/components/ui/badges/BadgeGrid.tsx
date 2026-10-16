import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { BadgeMedallion } from '@components/ui/badges/BadgeMedallion';
import { bodyText, mutedText, titleText } from '@constants/appText';
import { Colors } from '@constants/Colors';
import type { PlayerBadgeView } from '@constants/westAfricanBadges';

export function BadgeGrid({ badges }: { badges: PlayerBadgeView[] }) {
  const prev = useRef<Set<string>>(new Set());
  const [opened, setOpened] = useState<PlayerBadgeView | null>(null);
  const [justEarned, setJustEarned] = useState<Set<string>>(new Set());

  useEffect(() => {
    const next = new Set(badges.filter((badge) => badge.earned).map((badge) => badge.code));
    const fresh = [...next].filter((code) => !prev.current.has(code));
    if (prev.current.size > 0 && fresh.length) setJustEarned(new Set(fresh));
    prev.current = next;
  }, [badges]);

  return (
    <>
      <View style={styles.grid}>
        {badges.map((badge) => (
          <View key={badge.code} style={styles.item}>
            <BadgeMedallion
              badge={badge}
              size="md"
              celebrate={justEarned.has(badge.code)}
              onPress={() => setOpened(badge)}
            />
            <Text style={styles.name} numberOfLines={1}>
              {badge.name}
            </Text>
            <Text style={styles.motif} numberOfLines={1}>
              {badge.motif}
            </Text>
            <Text style={[styles.state, badge.earned && styles.stateOn]}>
              {badge.earned ? 'Obtenu' : 'À gagner'}
            </Text>
          </View>
        ))}
      </View>

      <Modal visible={opened != null} transparent animationType="fade" onRequestClose={() => setOpened(null)}>
        <View style={styles.detail}>
          <Pressable style={styles.backdrop} onPress={() => setOpened(null)} accessibilityLabel="Fermer" />
          {opened ? (
            <View style={styles.card}>
              <BadgeMedallion badge={opened} size="lg" celebrate={opened.earned} />
              <Text style={styles.detailTitle}>{opened.name}</Text>
              <Text style={styles.motif}>{opened.motif}</Text>
              <Text style={styles.how}>{opened.how}</Text>
              <Text style={[styles.state, opened.earned && styles.stateOn]}>
                {opened.earned ? 'Obtenu' : 'À gagner'}
              </Text>
              <Pressable accessibilityRole="button" onPress={() => setOpened(null)} style={styles.close}>
                <Text style={styles.closeText}>Fermer</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  item: { width: '47%', alignItems: 'center', gap: 4 },
  name: { ...titleText, fontSize: 14, color: Colors.textPrimary, textAlign: 'center' },
  motif: { ...mutedText, fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
  how: { ...mutedText, fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  state: { ...bodyText, fontSize: 12, color: Colors.textMuted },
  stateOn: { color: '#C07A00' },
  detail: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26, 26, 46, 0.46)' },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderRadius: 22,
    backgroundColor: '#FFFAF2',
  },
  detailTitle: { ...titleText, fontSize: 22, color: Colors.textPrimary, marginTop: 8 },
  close: {
    marginTop: 8,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { ...titleText, color: '#FFFFFF', fontSize: 16 },
});
