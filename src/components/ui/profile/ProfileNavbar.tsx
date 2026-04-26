import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { QuizzoLogoMark } from '@components/ui/brand/QuizzoLogoMark';
import { ProfileTheme } from '@constants/profileTheme';

import type { ProfileFontFamilies } from './ProfileFonts';

export interface ProfileNavbarActionHandlers {
  onDirectMessages?: () => void;
  onActivity?: () => void;
  onSettings?: () => void;
}

interface ProfileNavbarProps {
  title: string;
  fonts: ProfileFontFamilies;
  actions?: ProfileNavbarActionHandlers;
}

export function ProfileNavbar({ title, fonts, actions }: ProfileNavbarProps) {
  return (
    <View style={styles.row}>
      <View style={styles.logoTitle}>
        <QuizzoLogoMark size={28} />
        <Text style={[styles.title, fonts.bold && { fontFamily: fonts.bold }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.icons}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Messages directs"
          onPress={actions?.onDirectMessages}
          style={styles.iconHit}
        >
          <Feather name="users" size={22} color={ProfileTheme.grey900} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Activité"
          onPress={actions?.onActivity}
          style={styles.iconHit}
        >
          <Feather name="bar-chart-2" size={22} color={ProfileTheme.grey900} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Paramètres"
          onPress={actions?.onSettings}
          style={styles.iconHit}
        >
          <Feather name="settings" size={22} color={ProfileTheme.grey900} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    maxWidth: ProfileTheme.contentMaxWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ProfileTheme.navbarPaddingV,
    gap: ProfileTheme.navbarGap,
  },
  logoTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ProfileTheme.navbarGap,
    minHeight: 38,
  },
  title: {
    flex: 1,
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '700',
    color: ProfileTheme.grey900,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: ProfileTheme.iconRowGap,
    width: 124,
  },
  iconHit: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
