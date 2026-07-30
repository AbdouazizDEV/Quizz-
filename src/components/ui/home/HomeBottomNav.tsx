import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Routes } from '@constants/Routes';
import { Spacing } from '@constants/Spacing';

interface HomeBottomNavProps {
  height: number;
}

type NavItemId = 'home' | 'play' | 'defis' | 'gains' | 'profile';

interface NavItem {
  id: NavItemId;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  disabled?: boolean;
}

function resolveActiveNavId(pathname: string): NavItemId {
  if (pathname.includes('profile')) return 'profile';
  if (pathname.includes('defis')) return 'defis';
  if (pathname.includes('gains') || pathname.includes('premium')) return 'gains';
  if (pathname.includes('categories') || pathname.includes('/quiz/')) return 'play';
  return 'home';
}

export function HomeBottomNav({ height }: HomeBottomNavProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const activeId = resolveActiveNavId(pathname);

  const items: NavItem[] = [
    { id: 'home', icon: 'home', label: 'Accueil' },
    { id: 'play', icon: 'play-circle', label: 'Jouer' },
    { id: 'defis', icon: 'flag', label: 'Défis' },
    { id: 'gains', icon: 'gift', label: 'Gains' },
    { id: 'profile', icon: 'user', label: 'Profil' },
  ];

  const onTabPress = (id: NavItemId) => {
    if (id === 'home') {
      router.replace(Routes.HOME);
      return;
    }
    if (id === 'play') {
      router.push(Routes.CATEGORIES);
      return;
    }
    if (id === 'defis') {
      router.replace(Routes.DEFIS);
      return;
    }
    if (id === 'gains') {
      router.replace(Routes.GAINS);
      return;
    }
    if (id === 'profile') {
      router.replace(Routes.PROFILE);
    }
  };

  return (
    <View style={[styles.bottomBar, { minHeight: height, paddingBottom: Math.max(10, insets.bottom) }]}>
      <View style={styles.bottomBarRow}>
        {items.map((item) => {
          const active = item.id === activeId;
          const disabled = item.disabled === true;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active, disabled }}
              disabled={disabled}
              onPress={disabled ? undefined : () => onTabPress(item.id)}
              style={[styles.bottomItem, disabled && styles.bottomItemDisabled]}
            >
              <Feather
                name={item.icon}
                size={21}
                color={disabled ? '#C5C7D0' : active ? '#212121' : '#8D8F9A'}
              />
              <Text
                style={[
                  styles.bottomLabel,
                  active && !disabled && styles.bottomLabelActive,
                  disabled && styles.bottomLabelDisabled,
                ]}
              >
                {item.label}
              </Text>
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
    bottom: -2,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
  },
  bottomBarRow: {
    width: '100%',
    maxWidth: Spacing.onboardingMaxWidth + 48,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bottomItem: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  bottomLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8D8F9A',
  },
  bottomLabelActive: {
    color: '#212121',
    fontWeight: '800',
  },
  bottomLabelDisabled: {
    color: '#C5C7D0',
  },
  bottomItemDisabled: {
    opacity: 0.72,
  },
});
