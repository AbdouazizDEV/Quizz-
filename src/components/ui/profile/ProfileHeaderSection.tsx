import { StyleSheet, View } from 'react-native';

import type { ProfileStatItem } from '@app-types/profile.types';
import { ProfileTheme } from '@constants/profileTheme';
import { getLevelProgressDetail, type LevelProgressDetail } from '@utils/levelDisplay';

import type { ProfileFontFamilies } from './ProfileFonts';
import { ProfileCoverBanner } from './ProfileCoverBanner';
import { ProfileIdentityRow } from './ProfileIdentityRow';
import { ProfileInsightsCarousel } from './ProfileInsightsCarousel';
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
  /** Affiche le carousel gamification (profil perso uniquement). */
  showInsightsCarousel?: boolean;
  progressDetail?: LevelProgressDetail | null;
  quizzesCompleted?: number;
  streakDays?: number;
  isPremium?: boolean;
  premiumDaysLeft?: number;
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
  showInsightsCarousel = false,
  progressDetail = null,
  quizzesCompleted = 0,
  streakDays = 0,
  isPremium = false,
  premiumDaysLeft = 0,
}: ProfileHeaderSectionProps) {
  const resolvedProgress = progressDetail ?? getLevelProgressDetail(0);

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
        {showInsightsCarousel ? (
          <ProfileInsightsCarousel
            progress={resolvedProgress}
            stats={stats}
            quizzesCompleted={quizzesCompleted}
            streakDays={streakDays}
            isPremium={isPremium}
            premiumDaysLeft={premiumDaysLeft}
            fonts={fonts}
          />
        ) : (
          <ProfileStatsGrid stats={stats} fonts={fonts} />
        )}
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
