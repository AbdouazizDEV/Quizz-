import { Text, TextProps } from 'react-native';
import { Colors } from '@constants/Colors';

export function AppText(props: TextProps) {
  return <Text {...props} style={[{ color: Colors.textPrimary }, props.style]} />;
}
