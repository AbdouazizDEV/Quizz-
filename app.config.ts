import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Quizz+',
  slug: 'quizzplus',
  /** Deep links : quizzplus://auth/callback — après confirmation e-mail (pont localhost:3000). */
  scheme: 'quizzplus',
  version: '1.0.0',
  /** Requis pour EAS Build / Play Store — à adapter si vous changez l’identifiant. */
  ios: {
    bundleIdentifier: 'com.quizzplus.app',
  },
  android: {
    package: 'com.quizzplus.app',
  },
  extra: {
    env: process.env.EXPO_PUBLIC_ENV ?? 'local',
  },
  plugins: ['expo-router', 'expo-font', 'expo-secure-store', '@react-native-community/datetimepicker'],
});
