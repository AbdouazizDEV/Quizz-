import 'react-native-url-polyfill/auto';

import '@services/bootstrapDataProviders';

import * as WebBrowser from 'expo-web-browser';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
