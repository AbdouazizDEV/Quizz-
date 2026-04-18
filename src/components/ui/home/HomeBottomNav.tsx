import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';

interface HomeBottomNavProps {
  height: number;
}

type NavItemId = 'home' | 'chat' | 'rewards' | 'trophy' | 'profile';

export function HomeBottomNav({ height }: HomeBottomNavProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const activeId: NavItemId = pathname.includes('profile')
    ? 'profile'
    : pathname.includes('home')
      ? 'home'
      : 'home';

  const items = [
    { id: 'home' as const, icon: 'home' as const },
    { id: 'chat' as const, icon: 'message-circle' as const },
    { id: 'rewards' as const, icon: 'gift' as const },
    { id: 'trophy' as const, icon: 'award' as const },
    { id: 'profile' as const, icon: 'user' as const },
  ];

  const onTabPress = (id: NavItemId) => {
    if (id === 'home') {
      router.replace(Routes.HOME);
      return;
    }
    if (id === 'profile') {
      router.replace(Routes.PROFILE);
      return;
    }
  };

  return (
    <View style={[styles.bottomBar, { minHeight: height, paddingBottom: Math.max(10, insets.bottom) }]}>
      <View style={styles.bottomBarRow}>
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onTabPress(item.id)}
              style={styles.bottomItem}
            >
              <Feather name={item.icon} size={22} color={active ? '#212121' : '#8D8F9A'} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 2,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  bottomBarRow: {
    width: '100%',
    maxWidth: Spacing.onboardingMaxWidth + 48,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomItem: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#212121',
    marginTop: 8,
  },
});
