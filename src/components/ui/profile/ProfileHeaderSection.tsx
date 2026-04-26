import { StyleSheet, View } from 'react-native';

import type { ProfileStatItem } from '@app-types/profile.types';
import { ProfileTheme } from '@constants/profileTheme';

import type { ProfileFontFamilies } from './ProfileFonts';
import { ProfileCoverBanner } from './ProfileCoverBanner';
import { ProfileIdentityRow } from './ProfileIdentityRow';
import { ProfileStatsGrid } from './ProfileStatsGrid';

interface ProfileHeaderSectionProps {
  coverUri: string;
  displayName: string;
  handle: string;
  avatarUri: string;
  stats: ProfileStatItem[];
  fonts: ProfileFontFamilies;
  onEditProfile: () => void;
  onPressChangeCover: () => void;
  identityActionLabel?: string;
  identityActionVariant?: 'primary' | 'pending' | 'friend';
  identityActionDisabled?: boolean;
}

export function ProfileHeaderSection({
  coverUri,
  displayName,
  handle,
  avatarUri,
  stats,
  fonts,
  onEditProfile,
  onPressChangeCover,
  identityActionLabel,
  identityActionVariant,
  identityActionDisabled,
}: ProfileHeaderSectionProps) {
  return (
    <View style={styles.headerBlock}>
      <ProfileCoverBanner coverUri={coverUri} onPressChangeCover={onPressChangeCover} />
      <View style={styles.inner}>
        <ProfileIdentityRow
          displayName={displayName}
          handle={handle}
          avatarUri={avatarUri}
          fonts={fonts}
          onEditProfile={onEditProfile}
          actionLabel={identityActionLabel}
          actionVariant={identityActionVariant}
          actionDisabled={identityActionDisabled}
        />
        <View style={styles.divider} />
        <ProfileStatsGrid stats={stats} fonts={fonts} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    width: '100%',
    maxWidth: ProfileTheme.contentMaxWidth,
    alignItems: 'center',
    gap: ProfileTheme.sectionGap,
  },
  inner: {
    width: '100%',
    gap: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: ProfileTheme.grey200,
    width: '100%',
  },
});
