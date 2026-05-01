import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface SocialAuthButtonsProps {
  fontFamily?: string;
  loading?: boolean;
  onGooglePress: () => void;
  onFacebookPress: () => void;
}

interface SocialButtonProps {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  iconColor: string;
  fontFamily?: string;
  disabled?: boolean;
  onPress: () => void;
}

function SocialButton({ label, icon, iconColor, fontFamily, disabled, onPress }: SocialButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.buttonPressed]}
    >
      <Feather name={icon} size={20} color={iconColor} />
      <Text style={[styles.buttonText, fontFamily ? { fontFamily } : undefined]}>{label}</Text>
    </Pressable>
  );
}

export function SocialAuthButtons({
  fontFamily,
  loading = false,
  onGooglePress,
  onFacebookPress,
}: SocialAuthButtonsProps) {
  return (
    <View style={styles.container}>
      <SocialButton
        label="Continuer avec Google"
        icon="chrome"
        iconColor="#4285F4"
        fontFamily={fontFamily}
        disabled={loading}
        onPress={onGooglePress}
      />
      <SocialButton
        label="Continuer avec Facebook"
        icon="facebook"
        iconColor="#1877F2"
        fontFamily={fontFamily}
        disabled={loading}
        onPress={onFacebookPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
    minHeight: 56,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#212121',
  },
  buttonPressed: {
    opacity: 0.72,
  },
});
