import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Quizz+',
  slug: 'quizzplus',
  icon: './assets/Logo2.png',
  /** Deep links : quizzplus://auth/callback — après confirmation e-mail (pont localhost:3000). */
  scheme: 'quizzplus',
  version: '1.0.0',
  /** Requis pour EAS Build / Play Store — à adapter si vous changez l’identifiant. */
  ios: {
    bundleIdentifier: 'com.quizzplus.app',
  },
  android: {
    package: 'com.quizzplus.app',
    adaptiveIcon: {
      foregroundImage: './assets/Logo2.png',
      backgroundColor: '#FFFFFF',
    },
  },
  extra: {
    env: process.env.EXPO_PUBLIC_ENV ?? 'local',
  },
  plugins: ['expo-router', 'expo-font', 'expo-secure-store', '@react-native-community/datetimepicker'],
});
