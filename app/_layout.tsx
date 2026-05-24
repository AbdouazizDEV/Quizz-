import 'react-native-url-polyfill/auto';

import '@services/bootstrapDataProviders';

import * as WebBrowser from 'expo-web-browser';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { AppQueryProvider } from '@providers/AppQueryProvider';
import { AppErrorProvider } from '@providers/AppErrorProvider';
import { OfflineProvider } from '@providers/OfflineProvider';
import { OfflineSyncBridge } from '@providers/OfflineSyncBridge';
import { OfflineBanner } from '@components/ui/common/OfflineBanner';

export default function RootLayout() {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return (
    <AppQueryProvider>
      <OfflineProvider>
        <AppErrorProvider>
          <OfflineSyncBridge />
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }} />
        </AppErrorProvider>
      </OfflineProvider>
    </AppQueryProvider>
  );
}
