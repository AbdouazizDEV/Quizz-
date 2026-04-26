import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileTheme } from '@constants/profileTheme';

import type { ProfileFontFamilies } from './ProfileFonts';

interface ProfileIdentityRowProps {
  displayName: string;
  handle: string;
  avatarUri: string;
  fonts: ProfileFontFamilies;
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
  onEditProfile,
  actionLabel = 'Edit Profile',
  actionVariant = 'primary',
  actionDisabled = false,
}: ProfileIdentityRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <View style={styles.textCol}>
          <Text style={[styles.name, fonts.bold && { fontFamily: fonts.bold }]} numberOfLines={1}>
            {displayName}
          </Text>
          <Text
            style={[styles.handle, fonts.medium && { fontFamily: fonts.medium }]}
            numberOfLines={1}
          >
            {handle}
          </Text>
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
  name: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '700',
    color: ProfileTheme.grey900,
  },
  handle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: ProfileTheme.grey700,
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
    fontWeight: '600',
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
