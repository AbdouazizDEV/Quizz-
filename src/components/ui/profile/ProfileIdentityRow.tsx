import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileTheme } from '@constants/profileTheme';

import type { ProfileFontFamilies } from './ProfileFonts';

interface ProfileIdentityRowProps {
  displayName: string;
  handle: string;
  avatarUri: string;
  fonts: ProfileFontFamilies;
  onEditProfile: () => void;
}

export function ProfileIdentityRow({
  displayName,
  handle,
  avatarUri,
  fonts,
  onEditProfile,
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
        style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.88 }]}
      >
        <Text style={[styles.editLabel, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
          Edit Profile
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
    backgroundColor: ProfileTheme.primary500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: ProfileTheme.white,
  },
});
