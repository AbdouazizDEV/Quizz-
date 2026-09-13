import { ConfigContext, ExpoConfig } from 'expo/config';

const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? '';
const googleIosUrlScheme = googleClientId
  ? `com.googleusercontent.apps.${googleClientId.replace(/\.apps\.googleusercontent\.com$/i, '')}`
  : undefined;

const appPlugins: ExpoConfig['plugins'] = [
  'expo-router',
  'expo-font',
  'expo-secure-store',
  '@react-native-community/datetimepicker',
  'expo-sqlite',
  [
    'expo-camera',
    {
      cameraPermission: 'Quizz+ utilise la caméra pour scanner le QR code d’un ami.',
    },
  ],
  [
    'expo-build-properties',
    {
      android: {
        enableMinifyInReleaseBuilds: true,
        enableShrinkResourcesInReleaseBuilds: true,
        buildArchs: ['armeabi-v7a', 'arm64-v8a'],
      },
    },
  ],
];

if (googleIosUrlScheme) {
  appPlugins.push([
    '@react-native-google-signin/google-signin',
    { iosUrlScheme: googleIosUrlScheme },
  ]);
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Quizz+',
  slug: 'quizzplus',
  icon: './assets/icons/logo.png',
  /** Deep links : quizzplus://auth/callback — après confirmation e-mail (pont localhost:3000). */
  scheme: 'quizzplus',
  version: '1.0.0',
  /** Requis pour EAS Build / Play Store — à adapter si vous changez l’identifiant. */
  ios: {
    bundleIdentifier: 'com.quizzplus.app',
    associatedDomains: ['webcredentials:quizzp.com'],
    infoPlist: {
      LSApplicationQueriesSchemes: ['whatsapp', 'fb', 'fbapi', 'fb-messenger-share-api'],
      /** Pas de chiffrement non-exempté → évite la question EAS et la déclaration export. */
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.quizzplus.app',
    adaptiveIcon: {
      foregroundImage: './assets/icons/logo.png',
      backgroundColor: '#FFFFFF',
    },
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'quizzp.com',
            pathPrefix: '/friend',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  extra: {
    env: process.env.EXPO_PUBLIC_ENV ?? 'local',
    /** Lien projet EAS (expo.dev) — requis pour `eas build` avec app.config dynamique. */
    eas: {
      projectId: '23a2334f-26a5-4ae1-9911-56fcbed0ca9c',
    },
  },
  plugins: appPlugins,
});
