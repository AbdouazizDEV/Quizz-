import { Pressable, StyleSheet, Text } from 'react-native';

interface WalkthroughActionButtonProps {
  label: string;
  variant: 'primary' | 'secondary';
  onPress?: () => void;
  fontFamily?: string;
}

export function WalkthroughActionButton({
  label,
  variant,
  onPress,
  fontFamily,
}: WalkthroughActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, fontFamily ? { fontFamily } : undefined]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: 58,
    borderRadius: 100,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 5,
  },
  primary: {
    backgroundColor: '#FFD700',
    borderBottomColor: '#543ACC',
  },
  secondary: {
    backgroundColor: 'rgba(255, 215, 0, 0.17)',
    borderBottomColor: 'rgba(255, 215, 0, 0.31)',
  },
  text: {
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: '#000000',
  },
  pressed: {
    opacity: 0.9,
  },
});
