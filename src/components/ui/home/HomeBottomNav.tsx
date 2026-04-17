import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@constants/Spacing';

interface HomeBottomNavProps {
  height: number;
}

export function HomeBottomNav({ height }: HomeBottomNavProps) {
  const insets = useSafeAreaInsets();
  const items = [
    { id: 'home', icon: 'home', active: true },
    { id: 'chat', icon: 'message-circle', active: false },
    { id: 'rewards', icon: 'gift', active: false },
    { id: 'trophy', icon: 'award', active: false },
    { id: 'profile', icon: 'user', active: false },
  ] as const;

  return (
    <View style={[styles.bottomBar, { minHeight: height, paddingBottom: Math.max(10, insets.bottom) }]}>
      <View style={styles.bottomBarRow}>
        {items.map((item) => (
          <Pressable key={item.id} style={styles.bottomItem}>
            <Feather name={item.icon} size={22} color={item.active ? '#212121' : '#8D8F9A'} />
          </Pressable>
        ))}
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
