import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

interface WalkthroughActionButtonProps {
  label: string;
  variant: 'primary' | 'secondary';
  size?: 'default' | 'compact';
  onPress?: () => void;
  fontFamily?: string;
  leadingIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function WalkthroughActionButton({
  label,
  variant,
  size = 'default',
  onPress,
  fontFamily,
  leadingIcon,
  style,
  accessibilityLabel,
}: WalkthroughActionButtonProps) {
  const isCompact = size === 'compact';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        isCompact ? styles.compact : styles.default,
        leadingIcon ? styles.withIcon : null,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        style,
      ]}
    >
      {leadingIcon}
      <Text
        style={[
          styles.text,
          isCompact ? styles.textCompact : styles.textDefault,
          fontFamily ? { fontFamily } : undefined,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 5,
  },
  withIcon: {
    gap: 8,
  },
  default: {
    width: '100%',
    height: 58,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  compact: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 4,
  },
  primary: {
    backgroundColor: 'rgba(255, 215, 0, 0.87)',
    borderBottomColor: '#543ACC',
  },
  secondary: {
    backgroundColor: 'rgba(255, 215, 0, 0.17)',
    borderBottomColor: 'rgba(255, 215, 0, 0.31)',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
    color: '#000000',
  },
  textDefault: {
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  textCompact: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ translateY: 1 }],
  },
});
