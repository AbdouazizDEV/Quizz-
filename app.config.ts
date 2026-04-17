import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Quizz+',
  slug: 'quizzplus',
  version: '1.0.0',
  extra: {
    env: process.env.EXPO_PUBLIC_ENV ?? 'local',
  },
  plugins: ['expo-router', 'expo-font', 'expo-secure-store', '@react-native-community/datetimepicker'],
});
