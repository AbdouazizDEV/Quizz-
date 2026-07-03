import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { QuizzoLogoMark } from '@components/ui/brand/QuizzoLogoMark';

type FeatherIcon = ComponentProps<typeof Feather>['name'];

interface HomeTopNavbarProps {
  onPressSearch?: () => void;
  onPressNotifications?: () => void;
  onPressMenu?: () => void;
  notificationCount?: number;
  titleFontFamily?: string;
}

function NavIconButton({
  icon,
  label,
  onPress,
  badge,
}: {
  icon: FeatherIcon;
  label: string;
  onPress?: () => void;
  badge?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
    >
      <Feather name={icon} size={24} color="#212121" />
      {badge != null && badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function HomeTopNavbar({
  onPressSearch,
  onPressNotifications,
  onPressMenu,
  notificationCount = 0,
  titleFontFamily,
}: HomeTopNavbarProps) {
  return (
    <View style={styles.root}>
      <View style={styles.brand}>
        <NavIconButton icon="menu" label="Menu" onPress={onPressMenu} />
        <QuizzoLogoMark size={28} />
        <Text style={[styles.title, titleFontFamily ? { fontFamily: titleFontFamily } : undefined]}>
          Quizz+
        </Text>
      </View>

      <View style={styles.actions}>
        <NavIconButton icon="search" label="Rechercher" onPress={onPressSearch} />
        <NavIconButton
          icon={notificationCount > 0 ? 'bell' : 'bell-off'}
          label="Notifications"
          onPress={onPressNotifications}
          badge={notificationCount}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 38,
  },
  title: {
    fontSize: 24,
    lineHeight: 38,
    fontWeight: '700',
    color: '#212121',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 20,
  },
  iconBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    opacity: 0.65,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#FF4D4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
});
