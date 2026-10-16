import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { LevelBadge } from '@components/ui/home/LevelBadge';
import { formatLevelCodeLabel } from '@utils/levelDisplay';
import { ProfileTheme } from '@constants/profileTheme';

import type { ProfileFontFamilies } from './ProfileFonts';

interface ProfileIdentityRowProps {
  displayName: string;
  handle: string;
  avatarUri: string;
  fonts: ProfileFontFamilies;
  badgeSlot?: ReactNode;
  levelCode?: string;
  onEditProfile: () => void;
  actionLabel?: string;
  actionVariant?: 'primary' | 'pending' | 'friend';
  actionDisabled?: boolean;
}

export function ProfileIdentityRow({
  displayName,
  handle,
  avatarUri,
  fonts,
  badgeSlot,
  levelCode,
  onEditProfile,
  actionLabel = 'Modifier le profil',
  actionVariant = 'primary',
  actionDisabled = false,
}: ProfileIdentityRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <View style={styles.textCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, fonts.extraBold && { fontFamily: fonts.extraBold }]} numberOfLines={1}>
              {displayName}
            </Text>
            {badgeSlot}
          </View>
          <Text
            style={[styles.handle, fonts.medium && { fontFamily: fonts.medium }]}
            numberOfLines={1}
          >
            {handle}
          </Text>
          {levelCode ? (
            <View style={styles.levelRow}>
              <LevelBadge code={levelCode} />
              <Text style={[styles.levelLabel, fonts.semiBold && { fontFamily: fonts.semiBold }]} numberOfLines={1}>
                {formatLevelCodeLabel(levelCode).split('·').pop()?.trim()}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Modifier le profil"
        onPress={onEditProfile}
        disabled={actionDisabled}
        style={({ pressed }) => [
          styles.editBtn,
          actionVariant === 'primary' && styles.editBtnPrimary,
          actionVariant === 'pending' && styles.editBtnPending,
          actionVariant === 'friend' && styles.editBtnFriend,
          pressed && !actionDisabled && { opacity: 0.88 },
          actionDisabled && styles.editBtnDisabled,
        ]}
      >
        <Text
          style={[
            styles.editLabel,
            actionVariant === 'primary' && styles.editLabelPrimary,
            actionVariant === 'pending' && styles.editLabelPending,
            actionVariant === 'friend' && styles.editLabelFriend,
            fonts.semiBold && { fontFamily: fonts.semiBold },
          ]}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    minWidth: 0,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E7EB',
  },
  textCol: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  name: {
    flexShrink: 1,
    fontSize: 20,
    lineHeight: 32,
    color: ProfileTheme.grey900,
  },
  handle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: ProfileTheme.grey700,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  levelLabel: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '800',
    color: ProfileTheme.grey900,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: ProfileTheme.pillRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnPrimary: {
    backgroundColor: ProfileTheme.primary500,
  },
  editBtnPending: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  editBtnFriend: {
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  editBtnDisabled: {
    opacity: 0.9,
  },
  editLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  editLabelPrimary: {
    color: ProfileTheme.white,
  },
  editLabelPending: {
    color: '#374151',
  },
  editLabelFriend: {
    color: '#047857',
  },
});
