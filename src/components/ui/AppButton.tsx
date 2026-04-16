import { Pressable, Text } from 'react-native';
import { Colors } from '@constants/Colors';

interface AppButtonProps {
  title: string;
  onPress?: () => void;
}

export function AppButton({ title, onPress }: AppButtonProps) {
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: Colors.primary, padding: 12, borderRadius: 10 }}>
      <Text style={{ color: '#FFFFFF' }}>{title}</Text>
    </Pressable>
  );
}
