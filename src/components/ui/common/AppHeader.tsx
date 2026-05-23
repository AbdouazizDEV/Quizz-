import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';

import { StatisticsNavbar, type StatisticsNavbarRightAction } from '@components/ui/statistics/StatisticsNavbar';
import { Routes } from '@constants/Routes';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: StatisticsNavbarRightAction;
  fullWidth?: boolean;
}

export function AppHeader({
  title,
  showBack = true,
  onBack,
  rightAction,
  fullWidth = true,
}: AppHeaderProps) {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Nunito_700Bold });

  const fonts = useMemo(
    () => ({ bold: fontsLoaded ? 'Nunito_700Bold' : undefined }),
    [fontsLoaded],
  );

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(Routes.DEFIS);
  };

  if (!showBack) {
    return (
      <StatisticsNavbar
        title={title}
        fonts={fonts}
        onBack={() => undefined}
        rightAction={rightAction}
        fullWidth={fullWidth}
      />
    );
  }

  return (
    <StatisticsNavbar
      title={title}
      fonts={fonts}
      onBack={handleBack}
      rightAction={rightAction}
      fullWidth={fullWidth}
    />
  );
}
