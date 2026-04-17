import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@constants/Spacing';

import { WalkthroughActionButton } from './WalkthroughActionButton';

interface WalkthroughBottomBarProps {
  onPressStart?: () => void;
  onPressSignin?: () => void;
  buttonFontFamily?: string;
}

export function WalkthroughBottomBar({
  onPressStart,
  onPressSignin,
  buttonFontFamily,
}: WalkthroughBottomBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(24, 16 + insets.bottom) }]}>
      <View style={styles.actionsColumn}>
        <WalkthroughActionButton
          label="COMMENCER"
          variant="primary"
          onPress={onPressStart}
          fontFamily={buttonFontFamily}
        />
        <WalkthroughActionButton
          label="J'AI DÉJÀ UN COMPTE"
          variant="secondary"
          onPress={onPressSignin}
          fontFamily={buttonFontFamily}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 200,
    paddingTop: 24,
    paddingHorizontal: Spacing.screenHorizontal,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    width: '100%',
    maxWidth: '100%',
  },
  actionsColumn: {
    width: '100%',
    maxWidth: Spacing.onboardingMaxWidth,
    gap: 24,
  },
});
