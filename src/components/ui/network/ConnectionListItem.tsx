import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { ConnectionUser } from '@app-types/network.types';
import { NetworkTheme } from '@constants/networkTheme';
import { getConnectionRowMetrics } from '@utils/networkResponsiveLayout';

import type { ProfileFontFamilies } from '@components/ui/profile/ProfileFonts';

interface ConnectionListItemProps {
  user: ConnectionUser;
  fonts: ProfileFontFamilies;
  /** État effectif du bouton (peut différer du mock après action locale). */
  relationshipActive: boolean;
  onToggleFollow: () => void;
}

export function ConnectionListItem({
  user,
  fonts,
  relationshipActive,
  onToggleFollow,
}: ConnectionListItemProps) {
  const { width: screenWidth } = useWindowDimensions();
  const m = useMemo(() => getConnectionRowMetrics(screenWidth), [screenWidth]);

  const avatarStyle = useMemo(
    () => ({
      width: m.avatarSize,
      height: m.avatarSize,
      borderRadius: m.avatarSize / 2,
    }),
    [m.avatarSize],
  );

  return (
    <View style={[styles.row, { gap: m.rowGap, minHeight: m.rowMinHeight }]}>
      <Image source={{ uri: user.avatarUri }} style={[styles.avatar, avatarStyle]} />
      <View style={styles.textCol}>
        <Text
          style={[
            styles.name,
            { fontSize: m.nameFontSize, lineHeight: m.nameFontSize + (m.nameMaxLines > 1 ? 8 : 6) },
            fonts.bold && { fontFamily: fonts.bold },
          ]}
          numberOfLines={m.nameMaxLines}
        >
          {user.displayName}
        </Text>
        <Text
          style={[
            styles.handle,
            { fontSize: m.handleFontSize, lineHeight: m.handleFontSize + 6 },
            fonts.medium && { fontFamily: fonts.medium },
          ]}
          numberOfLines={1}
        >
          {user.handle}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: relationshipActive }}
        accessibilityLabel={relationshipActive ? 'Ne plus suivre' : 'Suivre'}
        onPress={onToggleFollow}
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        style={({ pressed }) => [
          styles.action,
          {
            paddingHorizontal: m.buttonPaddingH,
            minWidth: m.buttonMinWidth,
          },
          relationshipActive ? styles.actionFollowing : styles.actionFollow,
          pressed && styles.actionPressed,
        ]}
      >
        <Text
          style={[
            styles.actionText,
            { fontSize: m.actionFontSize, lineHeight: m.actionFontSize + 5 },
            relationshipActive ? styles.actionTextFollowing : styles.actionTextFollow,
            fonts.semiBold && { fontFamily: fonts.semiBold },
          ]}
        >
          {relationshipActive ? 'Following' : 'Follow'}
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
    paddingVertical: 2,
  },
  avatar: {
    backgroundColor: '#E5E7EB',
    flexShrink: 0,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 4,
    paddingRight: 4,
  },
  name: {
    fontWeight: '700',
    letterSpacing: 0.1,
    color: NetworkTheme.grey900,
  },
  handle: {
    fontWeight: '500',
    letterSpacing: 0.15,
    color: NetworkTheme.grey700,
  },
  action: {
    borderRadius: 100,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    paddingVertical: 7,
  },
  actionPressed: {
    opacity: 0.88,
  },
  actionFollow: {
    backgroundColor: NetworkTheme.primary500,
  },
  actionFollowing: {
    backgroundColor: NetworkTheme.listSurface,
    borderWidth: 1.5,
    borderColor: NetworkTheme.accentYellow,
  },
  actionText: {
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  actionTextFollow: {
    color: NetworkTheme.white,
  },
  actionTextFollowing: {
    color: NetworkTheme.accentYellowText,
  },
});
