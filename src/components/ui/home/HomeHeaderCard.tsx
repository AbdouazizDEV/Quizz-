import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

/** Largeur de référence (iPhone 11 / Pixel) — en dessous, les tailles diminuent. */
const REF_WIDTH = 390;

interface HomeHeaderCardProps {
  glowOpacity: Animated.Value;
  progress: number;
  /** Initiale(s) dans l’avatar. */
  avatarInitial?: string;
  /** Photo réelle de l'utilisateur (fallback sur initiale si absente). */
  avatarUri?: string;
  /** Deuxième ligne sous « Bonjour » (ex. « Prénom 👋 »). */
  displayNameWithEmoji?: string;
  /** Score affiché en grand (chaîne déjà formatée). */
  totalScoreDisplay?: string;
  /** Sous le score (niveau + libellé). */
  levelLabel?: string;
  /** Texte à droite avec l’icône médaille (classement — pas encore côté API). */
  rankLabel?: string;
  /** Texte à droite avec l’icône horloge (série ou jours actifs). */
  streakOrDaysLabel?: string;
  progressLabelLeft?: string;
  progressLabelRight?: string;
  notificationCount?: number;
  onPressNotifications?: () => void;
  onPressAvatar?: () => void;
}

export function HomeHeaderCard({
  glowOpacity,
  progress,
  avatarInitial = 'A',
  avatarUri,
  displayNameWithEmoji = 'Joueur 👋',
  totalScoreDisplay = '0',
  levelLabel = '🌱 Niveau 1 · Débutant',
  rankLabel = '#—',
  streakOrDaysLabel = '0 jour',
  progressLabelLeft = 'Niv. 1',
  progressLabelRight = 'Niv. 2',
  notificationCount = 0,
  onPressNotifications,
  onPressAvatar,
}: HomeHeaderCardProps) {
  const { width, fontScale: systemFontScale } = useWindowDimensions();

  const sizes = useMemo(() => {
    const widthRatio = Math.min(1.08, Math.max(0.78, width / REF_WIDTH));
    const accessibilityCap = Math.min(systemFontScale, 1.25);
    const s = (dp: number) => Math.max(10, Math.round(dp * widthRatio * accessibilityCap));

    return {
      greeting: s(14),
      name: s(26),
      nameLine: s(31),
      avatar: s(18),
      avatarBox: s(44),
      bellIcon: s(17),
      bellBox: s(40),
      bellDot: s(7),
      scoreLabel: s(13),
      scoreValue: s(38),
      scoreValueLine: s(42),
      level: s(13),
      meta: s(17),
      metaLine: s(21),
      metaIcon: s(15),
      progressLabel: s(12),
      progressTrack: Math.max(6, s(7)),
    };
  }, [width, systemFontScale]);

  return (
    <LinearGradient
      colors={['#2A2D5E', '#3B3F7A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerCard}
    >
      <Animated.View style={[styles.glowCircle, { opacity: glowOpacity }]} />
      <View style={styles.headerTopRow}>
        <Pressable
          style={[styles.avatar, { width: sizes.avatarBox, height: sizes.avatarBox, borderRadius: sizes.avatarBox / 2 }]}
          onPress={onPressAvatar}
          accessibilityRole="button"
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarText, { fontSize: sizes.avatar }]}>{avatarInitial}</Text>
          )}
        </Pressable>
        <View style={styles.headerIdentity}>
          <Text style={[styles.headerGreeting, { fontSize: sizes.greeting }]}>Bonjour</Text>
          <Text
            style={[
              styles.headerName,
              { fontSize: sizes.name, lineHeight: sizes.nameLine },
            ]}
          >
            {displayNameWithEmoji}
          </Text>
        </View>
        <Pressable
          style={[styles.bellBadge, { width: sizes.bellBox, height: sizes.bellBox, borderRadius: sizes.bellBox * 0.33 }]}
          onPress={onPressNotifications}
          accessibilityRole="button"
        >
          <Feather name="bell" size={sizes.bellIcon} color="#FFFFFF" />
          <View style={[styles.bellDot, { width: sizes.bellDot, height: sizes.bellDot, borderRadius: sizes.bellDot / 2, top: sizes.bellDot * 1.2, right: sizes.bellDot * 1.4 }]} />
          {notificationCount > 0 ? (
            <View style={styles.notificationBadgeOnBell}>
              <Text style={styles.notificationBadgeText}>{notificationCount > 99 ? '99+' : notificationCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.scoreCard}>
        <View style={styles.scoreMain}>
          <Text style={[styles.scoreLabel, { fontSize: sizes.scoreLabel }]}>Ton score</Text>
          <Text
            style={[
              styles.scoreValue,
              { fontSize: sizes.scoreValue, lineHeight: sizes.scoreValueLine },
            ]}
          >
            {totalScoreDisplay}
          </Text>
          <Text style={[styles.scoreLevel, { fontSize: sizes.level }]}>{levelLabel}</Text>
        </View>
        <View style={styles.scoreMeta}>
          <View style={styles.metaItem}>
            <Feather name="award" size={sizes.metaIcon} color="#F1C943" />
            <Text style={[styles.metaText, { fontSize: sizes.meta, lineHeight: sizes.metaLine }]}>{rankLabel}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="clock" size={sizes.metaIcon} color="#FF7A4D" />
            <Text style={[styles.metaText, { fontSize: sizes.meta, lineHeight: sizes.metaLine }]}>{streakOrDaysLabel}</Text>
          </View>
        </View>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabel, { fontSize: sizes.progressLabel }]}>{progressLabelLeft}</Text>
          <Text style={[styles.progressLabel, { fontSize: sizes.progressLabel }]}>{progressLabelRight}</Text>
        </View>
        <View style={[styles.progressTrack, { height: sizes.progressTrack }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 63, 122, 0.24)',
    padding: 16,
    gap: 16,
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 999,
    backgroundColor: '#6F7DFF',
    top: -82,
    right: -70,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerIdentity: {
    flex: 1,
    marginLeft: 12,
  },
  headerGreeting: {
    color: '#C8CFF8',
  },
  headerName: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  bellBadge: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    backgroundColor: '#FF7A4D',
  },
  scoreCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: 14,
  },
  scoreMain: {
    gap: 2,
  },
  scoreLabel: {
    color: '#AAB3E8',
    fontWeight: '600',
  },
  scoreValue: {
    color: '#F5D24A',
    fontWeight: '900',
  },
  scoreLevel: {
    color: '#CDD3F8',
  },
  scoreMeta: {
    position: 'absolute',
    right: 14,
    top: 14,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationBadgeOnBell: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: '#FF4D4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  metaText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  progressLabels: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: '#AAB3E8',
    fontWeight: '600',
  },
  progressTrack: {
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F5D24A',
  },
});
