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
  useWindowDimensions,
  View,
} from 'react-native';

import { Colors } from '@constants/Colors';
import { Routes } from '@constants/Routes';
import type { AuthBootstrapSnapshot } from '@services/auth/IAuthSessionService';
import { runAuthBootstrapAndSyncStore } from '@services/auth/authSessionController';

/** Base historique (200) ; le rendu est désormais dimensionné par écran pour une meilleure lisibilité. */
const REF_LOGO_SIZE = 200;
const REF_TITLE_FONT = 75;
const REF_TITLE_LINE = 120;
const REF_TITLE_WIDTH = 264;
const REF_TITLE_HEIGHT = 120;
const TITLE_COLOR = '#212121';

const LOADER_SIZE = 60;
const LOADER_BOTTOM = 106;
const DOT_COUNT = 8;
const DOT_RADIUS = 3;
const RING_RADIUS = 22;

const MIN_SPLASH_MS = 900;

function resolvePostSplashRoute(snapshot: AuthBootstrapSnapshot): string {
  // Règle produit:
  // - visiteur (aucun compte local): Home anonyme
  // - session valide en stockage: Home directement
  // - compte local sans session: Login
  if (snapshot.token?.trim()) {
    return Routes.HOME;
  }
  if (snapshot.hasRegisteredAccount) {
    return Routes.LOGIN;
  }
  return Routes.HOME;
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

function useSplashBrandMetrics() {
  const { width: windowWidth } = useWindowDimensions();
  /** ~62 % de la largeur utile, borné pour tablettes / grands écrans */
  const logoSize = Math.round(Math.min(340, Math.max(236, windowWidth * 0.62)));
  const scale = logoSize / REF_LOGO_SIZE;
  const titleFontSize = Math.round(REF_TITLE_FONT * scale);
  const titleLineHeight = Math.round(REF_TITLE_LINE * scale);
  const titleWidth = Math.round(REF_TITLE_WIDTH * scale);
  const titleHeight = Math.round(REF_TITLE_HEIGHT * scale);
  const centerBlockWidth = Math.max(titleWidth, logoSize + 8);
  const centerBlockMinHeight = Math.round(340 * scale);

  return {
    logoSize,
    titleFontSize,
    titleLineHeight,
    titleWidth,
    titleHeight,
    centerBlockWidth,
    centerBlockMinHeight,
  };
}

export default function SplashScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Nunito_700Bold });
  const brand = useSplashBrandMetrics();

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
        router.replace(Routes.HOME);
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
            {
              width: brand.centerBlockWidth,
              minHeight: brand.centerBlockMinHeight,
            },
          ]}
        >
          <View style={[styles.logoShell, { width: brand.logoSize, height: brand.logoSize }]}>
            <Image
              source={require('../../../assets/icons/logo.png')}
              style={{ width: brand.logoSize, height: brand.logoSize }}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </View>

          <View
            style={[
              styles.titleShell,
              {
                width: brand.titleWidth,
                height: brand.titleHeight,
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                {
                  fontSize: brand.titleFontSize,
                  lineHeight: brand.titleLineHeight,
                },
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
    borderRadius: 1000,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleShell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
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
