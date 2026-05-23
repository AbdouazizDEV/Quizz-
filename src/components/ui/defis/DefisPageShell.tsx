import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@components/ui/common/AppHeader';
import { HomeBottomNav } from '@components/ui/home/HomeBottomNav';
import { COLORS } from '@constants/Colors';
import { Spacing } from '@constants/Spacing';

const BOTTOM_NAV_HEIGHT = 86;

interface DefisPageShellProps {
  title: string;
  children: ReactNode;
  showBottomNav?: boolean;
}

export function DefisPageShell({ title, children, showBottomNav = false }: DefisPageShellProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth - Spacing.screenHorizontal * 2, Spacing.onboardingMaxWidth);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', COLORS.background]} style={styles.bg} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: Spacing.screenHorizontal,
          paddingBottom: (showBottomNav ? BOTTOM_NAV_HEIGHT : 24) + insets.bottom + 24,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.column, { maxWidth: contentWidth, width: contentWidth }]}>
          <AppHeader title={title} />
          {children}
        </View>
      </ScrollView>
      {showBottomNav ? <HomeBottomNav height={BOTTOM_NAV_HEIGHT} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  bg: { ...StyleSheet.absoluteFillObject },
  column: { gap: 16 },
});
