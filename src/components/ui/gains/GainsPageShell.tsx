import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@components/ui/common/AppHeader';
import { HomeBottomNav } from '@components/ui/home/HomeBottomNav';
import { GainsRoutes } from '@constants/gainsRoutes';
import { Spacing } from '@constants/Spacing';

const BOTTOM_NAV_HEIGHT = 86;

interface GainsPageShellProps {
  title: string;
  children: ReactNode;
  showBottomNav?: boolean;
  showBack?: boolean;
}

export function GainsPageShell({
  title,
  children,
  showBottomNav = false,
  showBack = true,
}: GainsPageShellProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, Spacing.onboardingMaxWidth);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFDF6', '#F4F6FB']} style={StyleSheet.absoluteFillObject} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: Spacing.screenHorizontal,
          paddingBottom: (showBottomNav ? BOTTOM_NAV_HEIGHT : 28) + insets.bottom + 24,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.column, { maxWidth: contentWidth, width: '100%' }]}>
          {showBack ? (
            <AppHeader
              title={title}
              onBack={() => {
                if (router.canGoBack()) {
                  router.back();
                  return;
                }
                router.replace(GainsRoutes.hub);
              }}
            />
          ) : (
            <View style={styles.hubTitleWrap}>
              <Text style={styles.hubTitle}>{title}</Text>
            </View>
          )}
          {children}
        </View>
      </ScrollView>
      {showBottomNav ? <HomeBottomNav height={BOTTOM_NAV_HEIGHT} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFDF6' },
  column: { gap: 16 },
  hubTitleWrap: {
    width: '100%',
    paddingVertical: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  hubTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#212121',
  },
});
