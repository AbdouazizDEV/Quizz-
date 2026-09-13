import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';
import { QuizPlayTheme } from '@constants/quizPlayTheme';

interface QuizResultsProcessingModalProps {
  visible: boolean;
  fonts: ProfileFontFamilies;
}

export function QuizResultsProcessingModal({ visible, fonts }: QuizResultsProcessingModalProps) {
  const spinOuter = useRef(new Animated.Value(0)).current;
  const spinInner = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.55)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      fade.setValue(0);
      return;
    }

    Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();

    const outerLoop = Animated.loop(
      Animated.timing(spinOuter, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const innerLoop = Animated.loop(
      Animated.timing(spinInner, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.55, duration: 900, useNativeDriver: true }),
      ]),
    );

    outerLoop.start();
    innerLoop.start();
    pulseLoop.start();

    return () => {
      outerLoop.stop();
      innerLoop.stop();
      pulseLoop.stop();
    };
  }, [visible, fade, pulse, spinInner, spinOuter]);

  const outerRotate = spinOuter.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const innerRotate = spinInner.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.98)', 'rgba(248,250,252,0.98)']}
          style={styles.card}
        >
          <Animated.View style={[styles.loaderWrap, { opacity: pulse }]}>
            <Animated.View style={[styles.ringOuter, { transform: [{ rotate: outerRotate }] }]}>
              <View style={styles.ringOuterArc} />
            </Animated.View>
            <Animated.View style={[styles.ringInner, { transform: [{ rotate: innerRotate }] }]}>
              <View style={styles.ringInnerArc} />
            </Animated.View>
            <View style={styles.loaderCore}>
              <Text style={styles.loaderEmoji}>✨</Text>
            </View>
          </Animated.View>

          <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]}>
            Résultats en cours de traitement
          </Text>
          <Text style={[styles.subtitle, fonts.medium && { fontFamily: fonts.medium }]}>
            Calcul de votre score…
          </Text>

          <View style={styles.dotsRow}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    opacity: pulse.interpolate({
                      inputRange: [0.55, 1],
                      outputRange: [0.35 + i * 0.15, 1],
                    }),
                    transform: [
                      {
                        scale: pulse.interpolate({
                          inputRange: [0.55, 1],
                          outputRange: [0.85, 1 + i * 0.08],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 20,
  },
  loaderWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  ringOuter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuterArc: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: QuizPlayTheme.primaryButton,
    borderRightColor: 'rgba(255, 215, 0, 0.35)',
  },
  ringInner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInnerArc: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: 'transparent',
    borderBottomColor: '#B88700',
    borderLeftColor: 'rgba(184, 135, 0, 0.35)',
  },
  loaderCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderEmoji: {
    fontSize: 20,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: QuizPlayTheme.grey900,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: QuizPlayTheme.primaryButton,
  },
});
