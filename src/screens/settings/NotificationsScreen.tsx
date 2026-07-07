import type { AppNotification } from '@app-types/notification.types';
import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { NotificationDeleteConfirmModal } from '@components/ui/settings/NotificationDeleteConfirmModal';
import { NotificationFilterChips } from '@components/ui/settings/NotificationFilterChips';
import { NotificationListItem } from '@components/ui/settings/NotificationListItem';
import { NotificationMessageModal } from '@components/ui/settings/NotificationMessageModal';
import { SettingsLeadingHeader } from '@components/ui/settings/SettingsLeadingHeader';
import { Routes } from '@constants/Routes';
import { DefisRoutes } from '@constants/defisRoutes';
import { SettingsScreenTheme } from '@constants/settingsScreenTheme';
import { useNotificationInteractions } from '@hooks/useNotificationInteractions';
import { useNotifications } from '@hooks/useNotifications';
import { useAppError } from '@providers/AppErrorProvider';
import { getNetworkHorizontalPadding } from '@utils/networkResponsiveLayout';

export default function NotificationsScreen() {
  const router = useRouter();
  const { showAppError } = useAppError();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontalPad = useMemo(() => getNetworkHorizontalPadding(width), [width]);

  const {
    filter,
    setFilter,
    items,
    unreadCount,
    loading,
    loadingMore,
    error,
    hasMore,
    actionId,
    refresh,
    loadMore,
    markRead,
    markAllRead,
    remove,
    acceptFriend,
    rejectFriend,
    acceptDuel,
    rejectDuel,
  } = useNotifications();
  const {
    messageItem,
    deleteTarget,
    deleteBusy,
    handlePress,
    requestDelete,
    cancelDelete,
    confirmDelete,
    closeMessage,
  } = useNotificationInteractions({
    markRead,
    remove,
  });

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_500Medium,
  });

  const fonts = useMemo(
    () => ({
      bold: fontsLoaded ? 'Nunito_700Bold' : undefined,
      semiBold: fontsLoaded ? 'Nunito_600SemiBold' : undefined,
      medium: fontsLoaded ? 'Nunito_500Medium' : undefined,
    }),
    [fontsLoaded],
  );

  const onBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(Routes.SETTINGS);
  }, [router]);

  const onAcceptDuel = useCallback(
    async (item: AppNotification) => {
      try {
        const duelId = await acceptDuel(item);
        router.push(DefisRoutes.duelDetail(duelId) as never);
      } catch (error) {
        showAppError(error instanceof Error ? error.message : "Impossible d'accepter le duel.", {
          title: 'Duel',
        });
      }
    },
    [acceptDuel, router, showAppError],
  );

  const onRejectDuel = useCallback(
    async (item: AppNotification) => {
      try {
        await rejectDuel(item);
      } catch (error) {
        showAppError(error instanceof Error ? error.message : 'Impossible de refuser le duel.', {
          title: 'Duel',
        });
      }
    },
    [rejectDuel, showAppError],
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFFFFF', '#FFF8E1']} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + SettingsScreenTheme.pagePaddingTop,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: horizontalPad,
          alignItems: 'center',
        }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} tintColor="#FFB703" />}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 120) {
            void loadMore();
          }
        }}
        scrollEventThrottle={200}
      >
        <View style={styles.inner}>
          <SettingsLeadingHeader title="Notifications" onBack={onBack} fonts={fonts} />

          <View style={styles.toolbar}>
            <NotificationFilterChips
              filter={filter}
              unreadCount={unreadCount}
              onChange={setFilter}
              fonts={fonts}
            />
            {unreadCount > 0 ? (
              <Pressable onPress={() => void markAllRead()} style={styles.markAllBtn}>
                <Feather name="check-circle" size={18} color="#1F2261" />
                <Text style={[styles.markAllTxt, fonts.semiBold && { fontFamily: fonts.semiBold }]}>
                  Tout lire
                </Text>
              </Pressable>
            ) : null}
          </View>

          {loading && items.length === 0 ? (
            <ActivityIndicator style={styles.loader} color="#FFB703" size="large" />
          ) : null}

          {error && items.length === 0 ? (
            <Text style={[styles.error, fonts.medium && { fontFamily: fonts.medium }]}>{error.message}</Text>
          ) : null}

          {!loading && items.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Feather name="bell-off" size={32} color="#9E9E9E" />
              </View>
              <Text style={[styles.emptyTitle, fonts.bold && { fontFamily: fonts.bold }]}>
                Aucune notification
              </Text>
              <Text style={[styles.emptySub, fonts.medium && { fontFamily: fonts.medium }]}>
                Les défis, demandes d'amis et annonces apparaîtront ici.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {items.map((item) => (
                <NotificationListItem
                  key={item.id}
                  item={item}
                  fonts={fonts}
                  busy={actionId === item.id}
                  onPress={() => void handlePress(item)}
                  onAcceptFriend={
                    item.type === 'friend_request' && !item.isRead
                      ? () => void acceptFriend(item.id)
                      : undefined
                  }
                  onRejectFriend={
                    item.type === 'friend_request' && !item.isRead
                      ? () => void rejectFriend(item.id)
                      : undefined
                  }
                  onAcceptDuel={
                    item.type === 'duel_request' && !item.isRead
                      ? () => void onAcceptDuel(item)
                      : undefined
                  }
                  onRejectDuel={
                    item.type === 'duel_request' && !item.isRead
                      ? () => void onRejectDuel(item)
                      : undefined
                  }
                  onDeleteRequest={() => requestDelete(item)}
                />
              ))}
            </View>
          )}

          {loadingMore ? <ActivityIndicator style={styles.moreLoader} color="#FFB703" /> : null}
          {!hasMore && items.length > 0 ? (
            <Text style={[styles.endHint, fonts.medium && { fontFamily: fonts.medium }]}>Fin de la liste</Text>
          ) : null}
        </View>
      </ScrollView>

      <NotificationMessageModal item={messageItem} fonts={fonts} onClose={closeMessage} />
      <NotificationDeleteConfirmModal
        item={deleteTarget}
        busy={deleteBusy || actionId === deleteTarget?.id}
        fonts={fonts}
        onCancel={cancelDelete}
        onConfirm={() => void confirmDelete()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { width: '100%', maxWidth: SettingsScreenTheme.contentMaxWidth, gap: 18 },
  toolbar: { gap: 12 },
  markAllBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  markAllTxt: { fontSize: 14, fontWeight: '700', color: '#1F2261' },
  loader: { marginTop: 40 },
  moreLoader: { marginTop: 16 },
  list: { gap: 10 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 10, paddingHorizontal: 16 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#424242' },
  emptySub: { fontSize: 14, color: '#757575', textAlign: 'center', lineHeight: 20 },
  error: { color: '#C62828', textAlign: 'center', marginTop: 24 },
  endHint: { textAlign: 'center', color: '#9E9E9E', fontSize: 13, marginTop: 8 },
});
