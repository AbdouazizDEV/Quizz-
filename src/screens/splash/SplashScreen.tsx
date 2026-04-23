import { Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@constants/Colors';
import { Routes } from '@constants/Routes';
import type { AuthBootstrapSnapshot } from '@services/auth/IAuthSessionService';
import { runAuthBootstrapAndSyncStore } from '@services/auth/authSessionController';

const CENTER_BLOCK = {
  width: 264,
  height: 340,
} as const;

const LOGO_SIZE = 200;
const TITLE_WIDTH = 264;
const TITLE_HEIGHT = 120;
const TITLE_FONT_SIZE = 75;
const TITLE_LINE_HEIGHT = 120;
const TITLE_COLOR = '#212121';

const LOADER_SIZE = 60;
const LOADER_BOTTOM = 106;
const DOT_COUNT = 8;
const DOT_RADIUS = 3;
const RING_RADIUS = 22;

const MIN_SPLASH_MS = 900;

function resolvePostSplashRoute(snapshot: AuthBootstrapSnapshot): string {
  // Règle produit: au redémarrage de l'app, forcer le passage par l'écran Login.
  // On n'auto-redirige plus vers Home même si un token persistant existe.
  if (snapshot.hasRegisteredAccount) {
    return Routes.LOGIN;
  }
  return Routes.WALKTHROUGH;
}

function DotRingLoader() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const center = LOADER_SIZE / 2;

  return (
    <View style={styles.loaderFrame} accessibilityRole="progressbar">
      <Animated.View
        style={[
          styles.loaderRing,
          { width: LOADER_SIZE, height: LOADER_SIZE, transform: [{ rotate }] },
        ]}
      >
        {Array.from({ length: DOT_COUNT }).map((_, i) => {
          const angle = (i / DOT_COUNT) * 2 * Math.PI - Math.PI / 2;
          const x = center + RING_RADIUS * Math.cos(angle) - DOT_RADIUS;
          const y = center + RING_RADIUS * Math.sin(angle) - DOT_RADIUS;
          const scale = 0.55 + (i / (DOT_COUNT - 1)) * 0.45;
          return (
            <View
              key={i}
              style={[
                styles.loaderDot,
                {
                  left: x,
                  top: y,
                  width: DOT_RADIUS * 2 * scale,
                  height: DOT_RADIUS * 2 * scale,
                  borderRadius: DOT_RADIUS * scale,
                  opacity: 0.35 + (i / (DOT_COUNT - 1)) * 0.65,
                },
              ]}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Nunito_700Bold });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const [snapshot] = await Promise.all([
          runAuthBootstrapAndSyncStore(),
          new Promise<void>((resolve) => setTimeout(resolve, MIN_SPLASH_MS)),
        ]);
        if (cancelled) return;
        router.replace(resolvePostSplashRoute(snapshot));
      } catch {
        if (cancelled) return;
        router.replace(Routes.WALKTHROUGH);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <View style={[styles.root, Platform.OS === 'web' && styles.rootWeb]}>
      <StatusBar style="dark" />
      <View style={styles.mainColumn}>
        <View
          style={[
            styles.centerBlock,
            { width: CENTER_BLOCK.width, minHeight: CENTER_BLOCK.height },
          ]}
        >
          <View style={styles.logoShell}>
            <Image
              source={require('../../../assets/icons/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </View>

          <View style={styles.titleShell}>
            <Text
              style={[
                styles.title,
                fontsLoaded ? { fontFamily: 'Nunito_700Bold' } : { fontWeight: '700' },
              ]}
              accessibilityRole="header"
            >
              Quizz+
            </Text>
          </View>
        </View>

        <View style={[styles.loaderWrap, { paddingBottom: LOADER_BOTTOM }]}>
          <DotRingLoader />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  /** react-native-web: flex:1 alone may not fill the viewport without a parent height */
  rootWeb: {
    minHeight: Dimensions.get('window').height,
  },
  mainColumn: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  logoShell: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 1000,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  titleShell: {
    width: TITLE_WIDTH,
    height: TITLE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    lineHeight: TITLE_LINE_HEIGHT,
    color: TITLE_COLOR,
    textAlign: 'center',
    includeFontPadding: false,
  },
  loaderWrap: {
    width: LOADER_SIZE,
    height: LOADER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderFrame: {
    width: LOADER_SIZE,
    height: LOADER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderRing: {
    position: 'relative',
  },
  loaderDot: {
    position: 'absolute',
    backgroundColor: Colors.primary,
  },
});
