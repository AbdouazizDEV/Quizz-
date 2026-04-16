import { TextInput, TextInputProps } from 'react-native';

export function AppInput(props: TextInputProps) {
  return <TextInput {...props} style={[{ borderWidth: 1, borderColor: '#E5E7EB', padding: 10, borderRadius: 10 }, props.style]} />;
}
