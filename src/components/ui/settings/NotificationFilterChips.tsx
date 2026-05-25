import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { NotificationFilter } from '@app-types/notification.types';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface NotificationFilterChipsProps {
  filter: NotificationFilter;
  unreadCount: number;
  onChange: (f: NotificationFilter) => void;
  fonts: ProfileFontFamilies;
}

export function NotificationFilterChips({
  filter,
  unreadCount,
  onChange,
  fonts,
}: NotificationFilterChipsProps) {
  const chips: { id: NotificationFilter; label: string; badge?: number }[] = [
    { id: 'all', label: 'Toutes' },
    { id: 'unread', label: 'Non lues', badge: unreadCount },
  ];

  return (
    <View style={styles.row}>
      {chips.map((chip) => {
        const active = filter === chip.id;
        return (
          <Pressable
            key={chip.id}
            onPress={() => onChange(chip.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipTxt, active && styles.chipTxtActive, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
              {chip.label}
            </Text>
            {chip.badge != null && chip.badge > 0 ? (
              <View style={[styles.badge, active && styles.badgeActive]}>
                <Text style={[styles.badgeTxt, fonts.bold && { fontFamily: fonts.bold }]}>
                  {chip.badge > 99 ? '99+' : chip.badge}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  chipActive: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFB703',
  },
  chipTxt: { fontSize: 14, fontWeight: '700', color: '#616161' },
  chipTxtActive: { color: '#1F2261' },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeActive: { backgroundColor: '#1F2261' },
  badgeTxt: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
});
