import { StyleSheet, View } from 'react-native';

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
  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
});
