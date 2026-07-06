import 'react-native-url-polyfill/auto';

import '@services/bootstrapDataProviders';

import * as WebBrowser from 'expo-web-browser';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppQueryProvider } from '@providers/AppQueryProvider';
import { AppErrorProvider } from '@providers/AppErrorProvider';
import { OfflineProvider } from '@providers/OfflineProvider';
import { OfflineSyncBridge } from '@providers/OfflineSyncBridge';
import { AuthSessionRefreshBridge } from '@providers/AuthSessionRefreshBridge';
import { FriendDeepLinkBridge } from '@providers/FriendDeepLinkBridge';
import { OfflineBanner } from '@components/ui/common/OfflineBanner';

export default function RootLayout() {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppQueryProvider>
        <OfflineProvider>
          <AppErrorProvider>
            <OfflineSyncBridge />
            <AuthSessionRefreshBridge />
            <FriendDeepLinkBridge />
            <OfflineBanner />
            <Stack screenOptions={{ headerShown: false }} />
          </AppErrorProvider>
        </OfflineProvider>
      </AppQueryProvider>
    </GestureHandlerRootView>
  );
}
