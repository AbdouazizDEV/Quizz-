import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState, type ComponentProps } from 'react';
import {
  Animated as RNAnimated,
  Image,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Routes } from '@constants/Routes';
import { shareFriendProfile } from '@services/network/shareFriendProfile';
import { buildFriendQrProfile, encodeFriendQrDeepLink } from '@utils/friendQrPayload';

/** Largeur de référence (iPhone 11 / Pixel) — en dessous, les tailles diminuent. */
const REF_WIDTH = 390;

interface HomeHeaderCardProps {
  glowOpacity: RNAnimated.Value;
  progress: number;
  userId?: string;
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
  /** Ex. « Encore 260 pts ». */
  pointsRemainingLabel?: string;
  /** Pourcentage entier 0–100 affiché à droite de la barre. */
  progressPercentLabel?: string;
  onPressAvatar?: () => void;
}

function QrActionButton({
  icon,
  label,
  onPress,
  variant = 'primary',
}: {
  icon: ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        variant === 'secondary' ? styles.actionBtnSecondary : styles.actionBtnPrimary,
        pressed && styles.actionBtnPressed,
      ]}
    >
      <Feather name={icon} size={18} color={variant === 'secondary' ? '#FFFFFF' : '#2A2D5E'} />
      <Text style={[styles.actionBtnText, variant === 'secondary' && styles.actionBtnTextSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

function MiniQrFlipHint({
  qrValue,
  innerSize,
  boxSize,
  onPress,
}: {
  qrValue: string;
  innerSize: number;
  boxSize: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Afficher mon QR profil"
      onPress={onPress}
      style={({ pressed }) => [
        styles.miniQrBtn,
        {
          width: boxSize,
          height: boxSize,
          borderRadius: Math.round(boxSize * 0.2),
        },
        pressed && styles.miniQrBtnPressed,
      ]}
    >
      <View style={[styles.miniQrInner, { width: innerSize, height: innerSize }]}>
        <QRCode
          value={qrValue}
          size={innerSize}
          backgroundColor="transparent"
          color="#2A2D5E"
          quietZone={0}
        />
      </View>
      <View style={styles.miniQrCornerAccent} />
    </Pressable>
  );
}

export function HomeHeaderCard({
  glowOpacity,
  progress,
  userId,
  avatarInitial = 'A',
  avatarUri,
  displayNameWithEmoji = 'Joueur 👋',
  totalScoreDisplay = '0',
  levelLabel = '🌱 Niveau 1 · Débutant',
  rankLabel = '#—',
  streakOrDaysLabel = '0 jour',
  progressLabelLeft = 'Niv. 1',
  progressLabelRight = 'Niv. 2',
  pointsRemainingLabel,
  progressPercentLabel,
  onPressAvatar,
}: HomeHeaderCardProps) {
  const router = useRouter();
  const { width, fontScale: systemFontScale } = useWindowDimensions();
  const [isFlipped, setIsFlipped] = useState(false);
  const [faceHeights, setFaceHeights] = useState({ front: 0, back: 0 });
  const flipProgress = useSharedValue(0);
  const containerHeight = useSharedValue(0);

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
      scoreLabel: s(13),
      scoreValue: s(38),
      scoreValueLine: s(42),
      level: s(13),
      meta: s(17),
      metaLine: s(21),
      metaIcon: s(15),
      progressLabel: s(12),
      progressTrack: Math.max(6, s(7)),
      backTitle: s(16),
      backHint: s(12),
      qrSize: Math.max(96, Math.min(128, Math.round(width * 0.28))),
      miniQrBox: Math.max(48, Math.min(58, Math.round(52 * widthRatio))),
      miniQrInner: Math.max(34, Math.min(42, Math.round(38 * widthRatio))),
    };
  }, [width, systemFontScale]);

  const qrProfile = useMemo(() => {
    if (!userId?.trim()) return null;
    const displayName = displayNameWithEmoji.replace(/\s*👋\s*$/, '').trim() || 'Joueur';
    const score = Number.parseInt(totalScoreDisplay.replace(/\s/g, ''), 10);
    return buildFriendQrProfile({
      userId,
      displayName,
      totalScore: Number.isFinite(score) ? score : 0,
      levelLabel,
    });
  }, [displayNameWithEmoji, levelLabel, totalScoreDisplay, userId]);

  const qrValue = useMemo(
    () => (qrProfile ? encodeFriendQrDeepLink(qrProfile) : ''),
    [qrProfile],
  );

  const miniQrValue = qrValue || 'quizzplus://profile';

  const onFrontLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = Math.ceil(event.nativeEvent.layout.height);
      if (height <= 0) return;
      setFaceHeights((prev) => ({ ...prev, front: height }));
      if (!isFlipped) containerHeight.value = height;
    },
    [containerHeight, isFlipped],
  );

  const onBackLayout = useCallback((event: LayoutChangeEvent) => {
    const height = Math.ceil(event.nativeEvent.layout.height);
    if (height <= 0) return;
    setFaceHeights((prev) => ({ ...prev, back: height }));
  }, []);

  const toggleFlip = useCallback(() => {
    const next = !isFlipped;
    const targetHeight = next
      ? faceHeights.back || faceHeights.front
      : faceHeights.front || faceHeights.back;

    setIsFlipped(next);
    flipProgress.value = withTiming(next ? 1 : 0, { duration: 620 });
    if (targetHeight > 0) {
      containerHeight.value = withTiming(targetHeight, { duration: 620 });
    }
  }, [containerHeight, faceHeights.back, faceHeights.front, flipProgress, isFlipped]);

  const flipSceneStyle = useAnimatedStyle(() => {
    if (containerHeight.value <= 0) return {};
    return { height: containerHeight.value };
  });

  const useNativeFlip = Platform.OS !== 'web';

  const flipContainerStyle = useAnimatedStyle(() => {
    if (useNativeFlip) return {};
    const rotateY = `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg`;
    return { transform: [{ rotateY }] };
  });

  const frontFaceStyle = useAnimatedStyle(() => {
    if (!useNativeFlip) return {};
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    const showFront = flipProgress.value < 0.5;
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity: showFront ? 1 : 0,
      zIndex: showFront ? 2 : 0,
    };
  });

  const backFaceStyle = useAnimatedStyle(() => {
    if (!useNativeFlip) return {};
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    const showBack = flipProgress.value >= 0.5;
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity: showBack ? 1 : 0,
      zIndex: showBack ? 2 : 0,
    };
  });

  const onShareProfile = useCallback(async () => {
    if (!qrProfile) return;
    try {
      await shareFriendProfile(qrProfile);
    } catch {
      if (qrValue) {
        await Share.share({ message: qrValue, title: 'Mon profil Quizz+' });
      }
    }
  }, [qrProfile, qrValue]);

  const onScanFriend = useCallback(() => {
    router.push(Routes.FRIEND_SCAN);
  }, [router]);

  const cardFace = (
    <>
      <RNAnimated.View style={[styles.glowCircle, { opacity: glowOpacity }]} />
      <MiniQrFlipHint
        qrValue={miniQrValue}
        innerSize={sizes.miniQrInner}
        boxSize={sizes.miniQrBox}
        onPress={toggleFlip}
      />
      <View style={[styles.headerTopRow, { paddingRight: sizes.miniQrBox + 10 }]}>
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Afficher mon QR profil"
          onPress={toggleFlip}
          style={styles.headerIdentity}
        >
          <Text style={[styles.headerGreeting, { fontSize: sizes.greeting }]}>Bonjour</Text>
          <Text style={[styles.headerName, { fontSize: sizes.name, lineHeight: sizes.nameLine }]}>
            {displayNameWithEmoji}
          </Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Afficher mon QR profil"
        onPress={toggleFlip}
        style={({ pressed }) => [styles.scoreCard, pressed && styles.scoreCardPressed]}
      >
        <View style={styles.scoreMain}>
          <Text style={[styles.scoreLabel, { fontSize: sizes.scoreLabel }]}>Ton score</Text>
          <Text style={[styles.scoreValue, { fontSize: sizes.scoreValue, lineHeight: sizes.scoreValueLine }]}>
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
            <Text style={[styles.metaText, { fontSize: sizes.meta, lineHeight: sizes.metaLine }]}>
              {streakOrDaysLabel}
            </Text>
          </View>
        </View>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabel, { fontSize: sizes.progressLabel }]}>{progressLabelLeft}</Text>
          {pointsRemainingLabel ? (
            <Text style={[styles.progressRemaining, { fontSize: sizes.progressLabel }]} numberOfLines={1}>
              {pointsRemainingLabel}
            </Text>
          ) : null}
          <Text style={[styles.progressLabel, { fontSize: sizes.progressLabel }]}>{progressLabelRight}</Text>
        </View>
        <View style={styles.progressRow}>
          <View
            style={[
              styles.progressTrack,
              { height: sizes.progressTrack, borderRadius: sizes.progressTrack / 2 },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  height: sizes.progressTrack,
                  borderRadius: sizes.progressTrack / 2,
                  width: `${Math.min(100, Math.max(0, progress * 100))}%`,
                },
              ]}
            />
          </View>
          {progressPercentLabel ? (
            <Text style={[styles.progressPercent, { fontSize: sizes.progressLabel }]}>
              {progressPercentLabel}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </>
  );

  const backFace = (
    <View style={styles.backPressable}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retourner à la carte score"
        onPress={toggleFlip}
        style={({ pressed }) => [styles.backTapArea, pressed && styles.backPressablePressed]}
      >
        <Text style={[styles.backTitle, { fontSize: sizes.backTitle }]}>Mon profil Quizz+</Text>
        <Text style={[styles.backHint, { fontSize: sizes.backHint }]}>
          Scanne ce QR pour m’ajouter en ami
        </Text>

        <View style={styles.qrWrap}>
          {qrProfile && qrValue ? (
            <QRCode value={qrValue} size={sizes.qrSize} backgroundColor="#FFFFFF" color="#1F2347" />
          ) : (
            <View style={[styles.qrPlaceholder, { width: sizes.qrSize, height: sizes.qrSize }]}>
              <Feather name="user-x" size={28} color="#9CA3CF" />
              <Text style={styles.qrPlaceholderText}>Connecte-toi pour afficher ton QR</Text>
            </View>
          )}
        </View>
      </Pressable>

      <View style={styles.actionRow}>
        <QrActionButton icon="share-2" label="Partager" onPress={() => void onShareProfile()} />
        <QrActionButton icon="maximize" label="Scanner" onPress={onScanFriend} variant="secondary" />
      </View>
    </View>
  );

  return (
    <Animated.View style={[styles.flipScene, flipSceneStyle]}>
      <Animated.View
        style={[
          styles.flipCard,
          Platform.OS === 'web' ? webFlipCardStyle : undefined,
          flipContainerStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.cardFace,
            useNativeFlip ? frontFaceStyle : undefined,
            Platform.OS === 'web' ? webCardFaceStyle : undefined,
          ]}
          pointerEvents={isFlipped ? 'none' : 'auto'}
          onLayout={onFrontLayout}
        >
          <LinearGradient
            colors={['#2A2D5E', '#3B3F7A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            {cardFace}
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.cardFace,
            styles.cardFaceBack,
            useNativeFlip ? backFaceStyle : undefined,
            Platform.OS === 'web' ? webCardFaceStyle : undefined,
          ]}
          pointerEvents={isFlipped ? 'auto' : 'none'}
          onLayout={onBackLayout}
        >
          <LinearGradient
            colors={['#252856', '#343878']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            {backFace}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const webFlipCardStyle = { transformStyle: 'preserve-3d' } as ViewStyle;
const webCardFaceStyle = { transformStyle: 'preserve-3d' } as ViewStyle;

const styles = StyleSheet.create({
  flipScene: {
    width: '100%',
    ...(Platform.OS === 'web' ? { perspective: 1200 } : {}),
  },
  flipCard: {
    width: '100%',
    position: 'relative',
  },
  cardFace: {
    width: '100%',
    backfaceVisibility: 'hidden',
  },
  cardFaceBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    ...(Platform.OS === 'web' ? { transform: [{ rotateY: '180deg' }] } : {}),
  },
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
  miniQrBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 210, 74, 0.55)',
    shadowColor: '#0F1230',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  miniQrBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  miniQrInner: {
    overflow: 'hidden',
    borderRadius: 4,
  },
  miniQrCornerAccent: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: '#F5D24A',
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
  scoreCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: 14,
  },
  scoreCardPressed: {
    opacity: 0.92,
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
  metaText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  progressLabels: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    color: '#AAB3E8',
    fontWeight: '600',
  },
  progressRemaining: {
    color: '#F5D24A',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  progressRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 10,
  },
  progressTrack: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    backgroundColor: '#F5D24A',
    minWidth: 2,
  },
  progressPercent: {
    color: '#FFFFFF',
    fontWeight: '800',
    minWidth: 36,
    textAlign: 'right',
  },
  backPressable: {
    alignItems: 'center',
    gap: 8,
  },
  backTapArea: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  backPressablePressed: {
    opacity: 0.94,
  },
  backTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  backHint: {
    color: '#C8CFF8',
    textAlign: 'center',
  },
  qrWrap: {
    padding: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  qrPlaceholderText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 16,
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnPrimary: {
    backgroundColor: '#F5D24A',
  },
  actionBtnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  actionBtnPressed: {
    opacity: 0.82,
  },
  actionBtnText: {
    color: '#2A2D5E',
    fontWeight: '800',
    fontSize: 14,
  },
  actionBtnTextSecondary: {
    color: '#FFFFFF',
  },
});
