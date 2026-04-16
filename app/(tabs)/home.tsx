import { View } from 'react-native';
import { AppText } from '@components/ui/AppText';

export default function HomePage() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <AppText>Home</AppText>
    </View>
  );
}
