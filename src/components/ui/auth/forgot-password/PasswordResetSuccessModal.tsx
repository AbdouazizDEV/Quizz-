import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { WalkthroughActionButton } from '@components/ui/walkthrough/WalkthroughActionButton';
import { ForgotPasswordFlowTheme } from '@constants/forgotPasswordFlowTheme';

export interface PasswordResetSuccessModalFonts {
  bold?: string;
  regular?: string;
}

interface PasswordResetSuccessModalProps {
  visible: boolean;
  onGoHome: () => void;
  fonts: PasswordResetSuccessModalFonts;
}

export function PasswordResetSuccessModal({
  visible,
  onGoHome,
  fonts,
}: PasswordResetSuccessModalProps) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardTranslateY = useRef(new Animated.Value(24)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const sparkRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!visible) {
      overlayOpacity.setValue(0);
      cardScale.setValue(0.9);
      cardTranslateY.setValue(24);
      pulse.setValue(1);
      spin.setValue(0);
      loopRef.current?.stop();
      sparkRef.current?.stop();
      return;
    }

    overlayOpacity.setValue(0);
    cardScale.setValue(0.9);
    cardTranslateY.setValue(24);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loopRef.current.start();

    sparkRef.current = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    sparkRef.current.start();

    return () => {
      loopRef.current?.stop();
      sparkRef.current?.stop();
    };
  }, [visible, overlayOpacity, cardScale, cardTranslateY, pulse, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onGoHome}>
      <View style={styles.root}>
        <Animated.View style={[styles.blurWrap, { opacity: overlayOpacity }]}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.dim} />
        </Animated.View>

        <Pressable style={styles.backdropPress} onPress={onGoHome} accessibilityRole="button" />

        <View style={styles.cardLayer} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.card,
              {
                opacity: overlayOpacity,
                transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.sparkRing,
                {
                  transform: [{ rotate }],
                },
              ]}
            >
              <View style={[styles.sparkDot, styles.sparkTop]} />
              <View style={[styles.sparkDot, styles.sparkRight]} />
              <View style={[styles.sparkDot, styles.sparkBottom]} />
              <View style={[styles.sparkDot, styles.sparkLeft]} />
            </Animated.View>

            <Animated.View
              style={[
                styles.checkCircle,
                {
                  transform: [{ scale: pulse }],
                },
              ]}
            >
              <Feather name="check" size={40} color="#FFFFFF" />
            </Animated.View>

            <Text
              style={[
                styles.title,
                fonts.bold ? { fontFamily: fonts.bold } : { fontWeight: '700' },
              ]}
            >
              Bienvenue de retour !
            </Text>
            <Text
              style={[
                styles.subtitle,
                fonts.regular ? { fontFamily: fonts.regular } : { fontWeight: '400' },
              ]}
            >
              Vous avez réussi à réinitialiser et à créer un nouveau mot de passe.
            </Text>

            <View style={styles.btnWrap}>
              <WalkthroughActionButton
                label="Aller à la maison"
                variant="primary"
                onPress={onGoHome}
                fontFamily={fonts.bold}
              />
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  blurWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ForgotPasswordFlowTheme.overlay,
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  cardLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 26,
    overflow: 'hidden',
  },
  sparkRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    top: 16,
    alignSelf: 'center',
  },
  sparkDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: '#F9D667',
  },
  sparkTop: { top: 0, left: 56 },
  sparkRight: { right: 0, top: 56 },
  sparkBottom: { bottom: 0, left: 56 },
  sparkLeft: { left: 0, top: 56 },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: ForgotPasswordFlowTheme.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
    color: ForgotPasswordFlowTheme.accentStrong,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: ForgotPasswordFlowTheme.textMuted,
    marginBottom: 20,
  },
  btnWrap: {
    width: '100%',
    marginTop: 4,
  },
});
